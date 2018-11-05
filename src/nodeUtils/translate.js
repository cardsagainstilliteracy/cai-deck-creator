const browserProm = require("./browserProm");

module.exports = async function(chinese) {
  const browser = await browserProm;
  const page = await browser.newPage();
  await page.goto("https://translate.google.com");
  await page.waitFor(() => document.querySelector("textarea"));
  page.evaluate(chinese => {
    const textarea = document.querySelector("textarea");
    textarea.value = chinese;
  }, chinese);
  await page.waitFor(
    () =>
      document.querySelector("#result_box") &&
      document.querySelector("#result_box").innerText.length > 0
  );
  const translation = await page.evaluate(() => {
    const resultBox = document.querySelector("#result_box");
    return resultBox.innerText;
  });
  return translation;
};
