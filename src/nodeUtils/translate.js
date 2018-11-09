const browserProm = require("./browserProm");

module.exports = async function(chinese) {
  const browser = await browserProm;
  const page = await browser.newPage();
  await page.goto(
    encodeURI(`https://translate.google.com/#zh-CN/en/${chinese}`),
  );
  await page.waitFor(
    () =>
      document.querySelector("#result_box") &&
      document.querySelector("#result_box").innerText.length > 0,
  );
  const meaning = await page.evaluate(() =>
    document.querySelector("#result_box").innerText.toLowerCase(),
  );
  await page.waitFor(
    () =>
      document.querySelector("#src-translit") &&
      document.querySelector("#src-translit").innerText.length > 0,
  );
  const characters = await page.evaluate(
    () => document.querySelector("#src-translit").innerText,
  );
  await page.goto(
    encodeURI(`https://translate.google.com/#zh-CN/en/${characters}`),
  );
  await page.waitFor(
    characters =>
      document.querySelector("#src-translit") &&
      document.querySelector("#src-translit").innerText !== characters,
    {},
    characters,
  );
  const pinyinWithTones = await page.evaluate(() =>
    document.querySelector("#src-translit").innerText.toLowerCase(),
  );
  return { meaning, characters, pinyinWithTones };
};
