import React, { Component } from "react";
import json5 from "json5";
import "./CAIDeckCreator.css";
import nodeUtils from "./nodeUtils/index";

const { translate } = nodeUtils;

const TRANSLATION_DELAY = 0.75e3;

class App extends Component {
  constructor() {
    super();
    this.state = {
      deckName: "1.1 Phrases",
      cards: [{ pinyin: "", characters: "", meaning: "", pinyinWithTones: "" }],
      translationCache: {
        "": { meaning: "", characters: "", pinyinWithTones: "" },
      },
    };
    ["onEditDeckName", "onCopy", "onHelp", "onPinyinInputKeyDown"].forEach(
      methodName => (this[methodName] = this[methodName].bind(this)),
    );
  }

  render() {
    return (
      <>
        <div className="Head">
          <input
            className="DeckNameInput"
            type="text"
            value={this.state.deckName}
            onChange={e => this.onEditDeckName(e.target.value)}
          />
          <button className="Button" onClick={this.onCopy}>
            Copy
          </button>
          <button className="Button" onClick={this.onHelp}>
            Help
          </button>
        </div>
        <div className="Body">
          <table>
            <thead>
              <tr>
                <th>Pinyin</th>
                <th>Characters</th>
                <th>Meaning</th>
                <th>Tones</th>
              </tr>
            </thead>
            <tbody>
              {this.state.cards.map((card, index) => (
                <tr>
                  <td>
                    <input
                      type="text"
                      value={card.pinyin}
                      onChange={e => this.editCardPinyin(index, e.target.value)}
                      onKeyDown={this.onPinyinInputKeyDown}
                    />
                  </td>
                  <td>{card.characters}</td>
                  <td>{card.meaning}</td>
                  <td>{card.pinyinWithTones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  editCardPinyin(editedIndex, pinyin) {
    this.setState(prevState => ({
      cards: prevState.cards.map(
        (card, index) => (index === editedIndex ? { ...card, pinyin } : card),
      ),
    }));

    const translation = this.state.translationCache[pinyin];
    if (translation !== undefined) {
      this.updateCard(editedIndex, translation);
    } else {
      this.updateCard(
        editedIndex,
        { meaning: "...", characters: "...", pinyinWithTones: "..." },
        { pinyin },
      );
      setTimeout(() => {
        if (this.state.cards[editedIndex].pinyin === pinyin) {
          console.log("translating " + pinyin);
          translate(pinyin).then(translation => {
            this.updateCard(editedIndex, translation, { pinyin });
            this.setState(prevState => ({
              translationCache: {
                ...prevState.translationCache,
                [pinyin]: translation,
              },
            }));
          });
        }
      }, TRANSLATION_DELAY);
    }
  }

  generateJS() {
    const cardsWithRenamedProperties = this.state.cards.map(
      ({ characters, meaning, pinyinWithTones: pinyin }) => ({
        characters,
        meaning,
        pinyin,
      }),
    );
    return (
      "export default " +
      json5.stringify(
        {
          name: this.state.deckName,
          cards: cardsWithRenamedProperties,
        },
        null,
        2,
      ) +
      ";"
    );
  }

  onCopy() {
    const textArea = document.createElement("textarea");
    textArea.value = this.generateJS();
    textArea.style.position = "fixed";
    textArea.style.left = "-100vw";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
  }

  onEditDeckName(deckName) {
    this.setState({ deckName });
  }

  onHelp() {
    // TODO: Make a prettier help page.
    alert(
      "Controls:\n\nEnter: New card\nUp/Down Arrows: Select previous/next card\nShift+Delete: Delete card",
    );
  }

  onPinyinInputKeyDown({ key, shiftKey, target }) {
    if (key === "Enter") {
      this.setState(
        prevState => ({
          cards: prevState.cards.concat({
            pinyin: "",
            characters: "",
            meaning: "",
          }),
        }),
        () => {
          const trs = target.parentNode.parentNode.parentNode.childNodes;
          trs[trs.length - 1].childNodes[0].childNodes[0].focus();
        },
      );
    } else if (key === "ArrowUp" || key === "Up") {
      const { previousSibling } = target.parentNode.parentNode;
      if (previousSibling) {
        previousSibling.childNodes[0].childNodes[0].focus();
      }
    } else if (key === "ArrowDown" || key === "Down") {
      const { nextSibling } = target.parentNode.parentNode;
      if (nextSibling) {
        nextSibling.childNodes[0].childNodes[0].focus();
      }
    } else if (
      shiftKey &&
      (key === "Backspace" || key === "Delete") &&
      this.state.cards.length > 1
    ) {
      const trs = Array.from(
        target.parentNode.parentNode.parentNode.childNodes,
      );
      const deletedIndex = trs.findIndex(
        tr => tr.childNodes[0].childNodes[0] === target,
      );
      if (deletedIndex > 0) {
        trs[deletedIndex - 1].childNodes[0].childNodes[0].focus();
      }
      this.setState(prevState => ({
        cards: prevState.cards.filter((_, index) => index !== deletedIndex),
      }));
    }
  }

  updateCard(editedIndex, changes, check = {}) {
    this.setState(
      prevState =>
        Object.entries(check).every(
          ([key, value]) => prevState.cards[editedIndex][key] === value,
        )
          ? {
              cards: prevState.cards.map(
                (card, index) =>
                  index === editedIndex ? { ...card, ...changes } : card,
              ),
            }
          : prevState,
    );
  }
}

export default App;
