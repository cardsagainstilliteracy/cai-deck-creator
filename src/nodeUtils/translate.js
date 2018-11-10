const browserProm = require("./browserProm");
const parse = require("./parse");

module.exports = async function(pinyin) {
  const browser = await browserProm;
  const segments = parse(pinyin);
  const characters = (await Promise.all(
    segments.map(async s => {
      const page = await browser.newPage();
      await page.goto(
        encodeURI(`https://translate.google.com/#zh-CN/en/${s.pinyin}`),
      );
      await page.waitFor(
        () =>
          document.querySelector("#src-translit") &&
          document.querySelector("#src-translit").innerText !== "",
      );
      const characterArray = (await page.evaluate(
        () => document.querySelector("#src-translit").innerText,
      )).split("");
      return s.indexes === null
        ? characterArray.join("")
        : s.indexes.map(i => characterArray[i]).join("");
    }),
  )).join("");
  const page = await browser.newPage();
  await page.goto(
    encodeURI(`https://translate.google.com/#zh-CN/en/${characters}`),
  );
  await page.waitFor(
    () =>
      document.querySelector("#result_box") &&
      document.querySelector("#result_box").innerText !== "" &&
      document.querySelector("#src-translit") &&
      document.querySelector("#src-translit").innerText !== "",
  );
  const { meaning, pinyinWithTones } = await page.evaluate(() => ({
    meaning: document.querySelector("#result_box").innerText.toLowerCase(),
    pinyinWithTones: document
      .querySelector("#src-translit")
      .innerText.toLowerCase(),
  }));
  return {
    meaning,
    pinyinWithTones,
    characters,
  };
};
