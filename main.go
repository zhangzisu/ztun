package main

import (
	"math/rand"
	"time"
)

func main() {
	rand.Seed(time.Now().Unix())
	asyncServeSniOrFail()
	asyncServeSocks5OrFail()
	wg.Wait()
}
