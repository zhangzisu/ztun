package main

import (
	"io/ioutil"
	"log"
	"strings"
	"sync"

	"github.com/pkg/errors"
)

type sniHost struct {
	name string
	addr string
}

var (
	hosts = []sniHost{}
	wg    sync.WaitGroup
)

func mustNil(e error) {
	if e != nil {
		log.Fatalf("%+v\n", errors.Wrap(e, ""))
	}
}

func parseSniWhitelist() {
	raw, _ := ioutil.ReadFile("sni_whitelist.txt")
	content := string(raw)
	lines := strings.Split(content, "\n")
	for _, line := range lines {
		line = strings.Trim(line, " ")
		if len(line) > 0 && !strings.HasPrefix(line, "#") {
			tokens := strings.Split(line, " ")
			if len(tokens) < 1 || len(tokens) > 2 {
				log.Fatalln("Bad sni_whitelist.txt")
			}
			host := sniHost{
				name: tokens[0],
			}
			if len(tokens) > 1 {
				host.addr = tokens[1]
			}
			hosts = append(hosts, host)
			log.Println("SNI + ", line)
		}
	}
}

func sniInclude(host string) (bool, string) {
	for _, item := range hosts {
		if item.name[0] == '*' {
			if strings.HasSuffix(host, item.name[1:]) || host == item.name[2:] {
				return true, item.addr
			}
		} else {
			if host == item.name {
				return true, item.addr
			}
		}
	}
	return false, ""
}

func init() {
	parseSniWhitelist()
}
