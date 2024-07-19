---
title: "justinribeiro/lite-youtubeでYouTube埋め込みのパフォーマンスを改善する"
description: "YouTubeのiframe埋め込みは特に大量に配置したときパフォーマンスに問題がある。justinribeiro/lite-youtubeを導入して改善を図ろう。"
---

## 概要

最近よかった曲のまとめとしてYouTubeのiframe埋め込みを貼りまくったブログ[^music]を書いているが、素直に埋め込みを入れるとページロード時に大量のリクエストが走るのでパフォーマンスがたいへん[^taihen]悪化する。

[^music]: [/blog/2024-06-30-music-2024-q2](/blog/2024-06-30-music-2024-q2) など
[^taihen]: これだけでLighthouseが60点ぐらいまで下がる

Googleからもいろいろと対応策が紹介されていて、その中にある `@justinribeiro/lite-youtube` というパッケージを使うとパフォーマンスを100点近くまで改善できる。

## やりかた

`@justinribeiro/lite-youtube` を入れて `<lite-youtube>` カスタム要素 (custom element) を使う。こいつが特定のタイミングまでiframe読み込みを遅延するようにふるまう。

```tsx
<lite-youtube videoid="w7HRowQMyLA" autoload />
```

デフォルトではクリックすることでロードされるが、`autoload` 属性をいれることで[IntersectionObserver](https://developer.mozilla.org/ja/docs/Web/API/IntersectionObserver)を使って画面に入ったとき読み込まれるようにできる。

なお遅延読み込み全般の考慮ポイントとして、要素の高さが静的に決定されるようにしないとレイアウトシフトを起こしてCLS指標が悪化するのに注意。直接高さを設定してもよいし、`max-width` と `aspect-ratio` を組み合わせてもよい。

## `loading="lazy"` との違い

`<iframe>` 要素に `loading="lazy"` を指定することでも遅延読み込みが可能で、[仕様と実装から読み解くHTMLのloading属性 - dwango on GitHub](https://dwango.github.io/articles/html-loading-attribute/) によれば内部的にIntersectionObserverを使うように仕様で指定されており、違いがなくブラウザ組み込みのぶん `loading="lazy"` のほうがよくみえる。

しかしさらにこの記事から引くとビューポートからどの程度の距離 (`rootMargin`) をもって「交差」（intersect）したとするかについては実装依存であり、特にBlink (Chromium) の値はかなり大きく、実際にiframeが画面上に出現するよりも余裕をもって読み込みが始まることになる。おそらくこのため、`loading="lazy"` を導入したときも劇的なパフォーマンス改善にはならなかった[^kiga]。一方で [`@justinribeiro/lite-youtube` では `rootMargin` は `0` であり](https://github.com/justinribeiro/lite-youtube/blob/50c254b579e92c39488af4b70a7240f96ba36eeb/lite-youtube.ts#L323)、ギリギリまで読み込みをケチることができ、LCP数値の向上にはこちらの効果が大きい。

[^kiga]: ような気がする。ちょっと前の検証なのであんま覚えてない
