---
title: "Rust: strtolっぽく文字列から数値と残りの文字列を得る"
description: "C 言語の `strtol` という関数は一見かなり奇妙なインターフェースをしているが、実際使ってみるとパーサ実装にめちゃくちゃ向いていることがわかる。Rustにもほしいよね。"
---

C 言語の標準ライブラリ `stdlib.h` には `strtol` という関数が定義されている。string to long (integer) と読めるこの関数は文字通り文字列 (`char*`) から数値を得るのだが、ついでに第 2 引数に渡したポインタを、パースが終了した位置まで進めてくれる機能も持っている。つまり、

```c
##include <stdio.h>
##include <stdlib.h>

int main(void) {
  char *endptr;
  long parsed = strtol("123abc", &endptr, 10); // 10進数
  printf("parsed: %ld\nendptr-> %s\n", parsed, endptr);
}
```

を実行すると

```
parsed: 123
endptr-> abc
```

が得られる。

Rust でもこのように、文字列を数値にパースして残りの文字列を得ることがしたい。そうして実装したのが以下 (CC0)。

```rust
fn str_to_fromstr<F: FromStr>(str: &str) -> Result<(F, &str), F::Err> {
    let iter = str.bytes().enumerate();

    let mut index = str.len();

    for (i, byte) in iter {
        if byte.is_ascii_digit() {
            continue;
        }

        index = i;
        break;
    }

    let digit_part = &str[..index];

    digit_part.parse().map(|value| (value, &str[index..]))
}

##[test]
fn strto_test() {
    assert_eq!(str_to_fromstr("123"), Ok((123, "")));
    assert_eq!(str_to_fromstr("123あいう"), Ok((123, "あいう")));
    assert!(str_to_fromstr::<i32>("あbc").is_err());
    assert!(str_to_fromstr::<i32>("").is_err());
}
```

`is_ascii_digit` な部分とそうでない部分の境界にあたるインデックスを探してスライスを取るだけ。スライスなのでコストも軽く収まっていると思う。よくやった。

`iter.peekable()` を使って実装しているというツイートを見かけたのではじめは peekable を使っていたのだが、最終的には普通に `for` で回すだけになった。途中でイキって `while let Some((i, byte)) in iter.next()` というアホのコードを書いていたところが反省点。

2022 年は多少不恰好でも動くコードを書こうということを(今さっき)目標に据えた。下手に `try_fold` を駆使せず素直に可変状態を扱ったのは大きな成長だが、`while let` がそれを潰して有り余るほどアホなのでまあアレという感じ。

## 追記

と思ったのだが、寝て起きたらやっぱりスマートに書きたくなってメソッドを探してしまった。やれやれ

```rust
fn str_to_fromstr<F: FromStr>(str: &str) -> Result<(F, &str), F::Err> {
    let index = str
        .bytes()
        .position(|byte| !byte.is_ascii_digit())
        .unwrap_or(str.len());

    let (digit_part, remaining_part) = str.split_at(index);

    digit_part.parse().map(|value| (value, remaining_part))
}
```
