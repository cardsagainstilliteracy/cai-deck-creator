const browserProm = require("./browserProm");
const parse = require("./parse");

module.exports = async function(pinyin) {
  const browser = await browserProm;
  const segments = parse(pinyin);
  const characters = (await Promise.all(
    segments.map(async s => {
      const page = await browser.newPage();
      await page.goto(
        `https://translate.google.com/#view=home&op=translate&sl=zh-CN&tl=en&text=${encodeURIComponent(
          s.pinyin,
        )}`,
      );
      await page.waitFor(
        () =>
          document.querySelector(
            ".tlid-transliteration-content.transliteration-content.full",
          ) &&
          document.querySelector(
            ".tlid-transliteration-content.transliteration-content.full",
          ).innerText !== "",
      );
      const characterArray = (await page.evaluate(
        () =>
          document.querySelector(
            ".tlid-transliteration-content.transliteration-content.full",
          ).innerText,
      )).split("");
      return s.indexes === null
        ? characterArray.join("")
        : s.indexes.map(i => characterArray[i]).join("");
    }),
  )).join("");
  const page = await browser.newPage();
  await page.goto(
    `https://translate.google.com/#view=home&op=translate&sl=zh-CN&tl=en&text=${encodeURIComponent(
      characters,
    )}`,
  );
  await page.waitFor(
    () =>
      document.querySelector(".text-wrap.tlid-copy-target") &&
      document.querySelector(".text-wrap.tlid-copy-target").innerText !== "" &&
      document.querySelector(
        ".tlid-transliteration-content.transliteration-content.full",
      ) &&
      document.querySelector(
        ".tlid-transliteration-content.transliteration-content.full",
      ).innerText !== "",
  );
  const { meaning, pinyinWithTones } = await page.evaluate(() => ({
    meaning: document
      .querySelector(".text-wrap.tlid-copy-target")
      .innerText.toLowerCase(),
    pinyinWithTones: document
      .querySelector(
        ".tlid-transliteration-content.transliteration-content.full",
      )
      .innerText.toLowerCase(),
  }));
  return {
    meaning,
    pinyinWithTones,
    characters,
  };
};
