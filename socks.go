package main

import (
	"context"
	"log"
	"net"

	socks5 "github.com/armon/go-socks5"
)

type rewriter struct{}

func (r *rewriter) Rewrite(ctx context.Context, request *socks5.Request) (context.Context, *socks5.AddrSpec) {
	result := &socks5.AddrSpec{
		FQDN: request.DestAddr.FQDN,
		IP:   request.DestAddr.IP,
		Port: request.DestAddr.Port,
	}
	host := request.DestAddr.FQDN
	if ok, _ := sniInclude(host); ok {
		addr, _ := net.ResolveIPAddr("ip", "127.0.0.1")
		result.IP = addr.IP
		result.Port = 4430
		result.FQDN = ""
	}
	return ctx, result
}

func asyncServeSocks5OrFail() {
	wg.Add(1)
	go serveSocks5OrFail()
}

func serveSocks5OrFail() {
	r := new(rewriter)
	conf := &socks5.Config{
		Rewriter: r,
	}
	server, err := socks5.New(conf)
	mustNil(err)
	log.Println("SOCKS5 Server started at 127.0.0.1:3080")
	mustNil(server.ListenAndServe("tcp", "127.0.0.1:3080"))
	wg.Done()
}
