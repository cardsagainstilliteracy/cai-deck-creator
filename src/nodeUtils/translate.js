const browserProm = require("./browserProm");

module.exports = async function(chinese) {
  const browser = await browserProm;
  const page = await browser.newPage();
  await page.goto("https://translate.google.com");
  await page.waitFor(() => document.querySelector("#gt-sl-gms"));
  await page.click("#gt-sl-gms");
  const id = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".goog-menuitem.goog-option"),
    ).find(m => m.innerText === "Chinese").id;
  });
  await page.click('div[id="' + id + '"]');
  await page.waitFor(() => document.querySelector("textarea"));
  page.evaluate(chinese => {
    const textarea = document.querySelector("textarea");
    textarea.value = chinese;
  }, chinese);
  await page.waitFor(
    () =>
      document.querySelector("#result_box") &&
      document.querySelector("#result_box").innerText.length > 0,
  );
  const meaning = await page.evaluate(() => {
    const resultBox = document.querySelector("#result_box");
    return resultBox.innerText;
  });
  await page.waitFor(
    () =>
      document.querySelector("#src-translit") &&
      document.querySelector("#src-translit").innerText.length > 0,
  );
  const characters = await page.evaluate(() => {
    const translitBox = document.querySelector("#src-translit");
    return translitBox.innerText;
  });
  page.evaluate(characters => {
    document.querySelector("textarea").value = characters;
  }, characters);
  await page.waitFor(
    characters =>
      document.querySelector("#src-translit") &&
      document.querySelector("#src-translit").innerText !== characters,
    {},
    characters,
  );
  const pinyinWithTones = await page.evaluate(
    () => document.querySelector("#src-translit").innerText,
  );
  return { meaning, characters, pinyinWithTones };
};
