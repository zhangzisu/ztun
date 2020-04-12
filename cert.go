package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"io/ioutil"
	"log"
	"math/big"
	"os"
	"path"
	"sync"
	"time"
)

var (
	certPath = "certs"
	caCert   []byte
	caPriv   *rsa.PrivateKey

	pending sync.Map

	defaultCert *tls.Certificate
)

func init() {
	os.MkdirAll(certPath, os.ModePerm)
	ensureCA()
}

func generateSN() *big.Int {
	max := new(big.Int).Lsh(big.NewInt(1), 128)
	sn, _ := rand.Int(rand.Reader, max)
	return sn
}

func generateX509CA() ([]byte, *rsa.PrivateKey) {
	log.Println("Generating CA cert")
	tmpl := &x509.Certificate{
		SerialNumber: generateSN(),
		Subject: pkix.Name{
			Organization: []string{"ZhangZisu.CN Authority"},
			CommonName:   "ZhangZisu CA",
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		IsCA:                  true,
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
	}
	priv, _ := rsa.GenerateKey(rand.Reader, 1024)
	cert, _ := x509.CreateCertificate(rand.Reader, tmpl, tmpl, &priv.PublicKey, priv)
	return cert, priv
}

func generateX509Cert(name string) ([]byte, *rsa.PrivateKey) {
	log.Println("Generating cert for ", name)
	tmpl := &x509.Certificate{
		SerialNumber: generateSN(),
		Subject: pkix.Name{
			CommonName: name,
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(10, 0, 0),
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:              x509.KeyUsageDigitalSignature | x509.KeyUsageKeyEncipherment,
		DNSNames:              []string{name},
		BasicConstraintsValid: true,
		IsCA:                  false,
	}
	priv, _ := rsa.GenerateKey(rand.Reader, 1024)
	ca, _ := x509.ParseCertificate(caCert)
	cert, _ := x509.CreateCertificate(rand.Reader, tmpl, ca, &priv.PublicKey, caPriv)
	return cert, priv
}

func writeX509Cert(cert []byte, priv *rsa.PrivateKey, prefix string) {
	os.MkdirAll(certPath, os.ModePerm)

	certFile, _ := os.Create(path.Join(certPath, prefix+".crt"))
	defer certFile.Close()
	pem.Encode(certFile, &pem.Block{
		Type:  "CERTIFICATE",
		Bytes: cert,
	})

	privFile, _ := os.Create(path.Join(certPath, prefix+".pem"))
	defer privFile.Close()
	pem.Encode(privFile, &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(priv),
	})
}

func loadX509Cert(prefix string) ([]byte, *rsa.PrivateKey, error) {
	certBytes, err := ioutil.ReadFile(path.Join(certPath, prefix+".crt"))
	if err != nil {
		return nil, nil, err
	}
	certPem, _ := pem.Decode(certBytes)
	cert := certPem.Bytes

	privBytes, err := ioutil.ReadFile(path.Join(certPath, prefix+".pem"))
	if err != nil {
		return nil, nil, err
	}
	privPem, _ := pem.Decode(privBytes)
	key, err := x509.ParsePKCS1PrivateKey(privPem.Bytes)
	if err != nil {
		return nil, nil, err
	}

	return cert, key, nil
}

func ensureCA() {
	cert, priv, err := loadX509Cert("ca")
	if err != nil {
		cert, priv = generateX509CA()
		writeX509Cert(cert, priv, "ca")
	}
	caCert = cert
	caPriv = priv
}

func loadTLSCert(prefix string) (tls.Certificate, error) {
	return tls.LoadX509KeyPair(path.Join(certPath, prefix+".crt"), path.Join(certPath, prefix+".pem"))
}

func generateTLSCert(name string) (tls.Certificate, error) {
	lock, ok := pending.Load(name)
	if ok {
		mutex, _ := lock.(*sync.Mutex)
		mutex.Lock()
		defer mutex.Unlock()
	} else {
		mutex := &sync.Mutex{}
		mutex.Lock()
		defer mutex.Unlock()
		pending.Store(name, mutex)
		defer pending.Delete(name)
	}
	cert, err := loadTLSCert(name)
	if err == nil {
		return cert, nil
	}
	x509, priv := generateX509Cert(name)
	writeX509Cert(x509, priv, name)
	cert, err = loadTLSCert(name)
	return cert, err
}

func getTLSCert(name string) *tls.Certificate {
	cert, err := loadTLSCert(name)
	if err != nil {
		cert, _ = generateTLSCert(name)
		return &cert
	}
	return &cert
}
