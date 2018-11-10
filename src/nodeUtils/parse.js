module.exports = pinyin =>
  pinyin
    .split(/(\[[^\[\]]*\])/g)
    .map(
      s =>
        s.includes("[")
          ? {
              pinyin: s.replace(/[^a-zA-Z ]/g, ""),
              indexes: s
                .split(/(\d+)/g)
                .map(x => parseInt(x, 10))
                .filter(x => !isNaN(x)),
            }
          : { pinyin: s, indexes: null },
    )
    .filter(s => s.pinyin !== "");
