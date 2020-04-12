package main

import (
	"crypto/tls"
	"log"
	"net/http"
	"net/http/httputil"

	doh "github.com/babolivier/go-doh-client"
)

func asyncServeSniOrFail() {
	wg.Add(1)
	go serveSniOrFail()
}

func serveSniOrFail() {
	proxy := createProxy()
	server := &http.Server{
		Addr:    "127.0.0.1:4430",
		Handler: proxy,
		TLSConfig: &tls.Config{
			GetCertificate: func(hello *tls.ClientHelloInfo) (*tls.Certificate, error) {
				return getTLSCert(hello.ServerName), nil
			},
		},
	}
	log.Println("SNI Server started at 127.0.0.1:4430")
	server.ListenAndServeTLS("", "")
	wg.Done()
}

func createProxy() *httputil.ReverseProxy {
	resolver := doh.Resolver{
		Host:  "1.0.0.1",
		Class: doh.IN,
	}
	proxy := &httputil.ReverseProxy{
		Director: func(req *http.Request) {
			host := req.Host
			if ok, addr := sniInclude(host); ok {
				req.URL.Scheme = "https"
				if len(addr) > 0 {
					log.Println("HOSTS ", host, " -> ", addr)
					req.URL.Host = addr
				} else {
					recs, _, _ := resolver.LookupA(host)
					log.Println("DOH ", host, " -> ", recs[0].IP4)
					if len(recs) > 0 {
						req.URL.Host = recs[0].IP4
					}
				}
				req.Header.Set("Host", host)
				req.Header.Set("Accept-Encoding", "")
				req.Host = host
			}
		},
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	return proxy
}
