# FaithJS
FaithJS はブラウザ上で動く NES(ファミコン)エミュレータです。

# きっかけ
コンピュータの仕組みについて知りたいなら NES エミュ作るのが手っ取り早いと、
優秀な人が強い事を言ってて、僕もコンピュータの仕組みについて知りたかったので、
実装しようと思いました。

# まず読んだ本
### コンピュータシステムの理論と実装
CPUやメモリの仕組みを大まかに知ることができる
### 30日でできる! OS自作入門
OSの仕組みやアセンブラの基本がわかる
### 自作エミュレータで学ぶx86アーキテクチャ-コンピュータが動く仕組みを徹底理解!
こちらもアセンブラに慣れるために読んだ
### たのしいバイナリの歩き方
バイナリに慣れるために読んだ

# 参考にしたサイト

http://pgate1.at-ninja.jp/NES_on_FPGA/index.html 
日本語。 

http://wiki.nesdev.com/w/index.php/Nesdev_Wiki 
英語。 

# Test ROMs
https://github.com/christopherpow/nes-test-roms

# 実装してみて
OS自作系の知識を応用して、CPUの実装までは容易にできる。その後 PPU APU等の
描画や音楽周りになってくると、ドキュメントを読んでも理解できないことが多かった。

ドキュメントを読んでも実装のイメージがまったく湧かなかったので、
とにかく他人が既に実装したコードを読み漁った。
人によって実装内容が異なり、また実装によって動くROM動かないROMが異なるので、
何を正にすればいいのか戸惑った。

# 他のJS系NESの実装
http://twoseater.hp2.jp/nes/index.html 

http://takahirox.github.io/nes-js/index.html 

https://github.com/peteward44/WebNES