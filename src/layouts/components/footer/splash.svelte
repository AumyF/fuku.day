<script lang="ts">
  const texts = [
    "何もしないをしている",
    "踊ってない夜を知らない",
    "どうだっていいよ、もう寝てたいよ",
    "「なんてことだ！死んでしまう！」",
    "Since I'm the mad scientist, proclaimed by myself",
    "とがれるだけとがっていけ",
    "それは私が決めます",
    "設計ミスの代償を被ってこのスケジュールだ",
    "規則的に断絶する意識は人を狂気から遠ざけます",
    "Wasshoi!",
    "一方的に脳内の独自設定を話さないでください！",
    "出かけたくない　出かけたくない　出かけたくない　出かけたくない",
    "エビバディちゃんと仕事してる？俺はしてないぜ",
    `<details style="text-align:center"><summary>人生のネタバレ</summary>「死ぬ」っぽいな</details>`,
  ];
  let text = $state<string>("");

  function roll() {
    text = texts[Math.floor(Math.random() * texts.length)] ?? "";
  }

  roll();
</script>

<div class="text-center">
  <p>
    {@html text}
  </p>
  <button
    onclick={roll}
    class="px-2 border border-neutral-400 rounded-lg hover:bg-neutral-200/70 active:bg-neutral-200"
    >roll</button
  >
</div>
