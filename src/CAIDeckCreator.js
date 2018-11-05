import React, { Component } from "react";
import "./CAIDeckCreator.css";
import nodeUtils from "./nodeUtils/index";

const { translate } = nodeUtils;

class App extends Component {
  constructor() {
    super();
    this.state = {
      deckName: "1.1 Phrases",
      cards: [{ pinyin: "", characters: "", meaning: "" }],
      translationCache: { "": "" },
    };
    ["onEditDeckName", "onDownload", "onPinyinInputKeyDown"].forEach(
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
          <button className="DownloadButton" onClick={this.onDownload}>
            Download
          </button>
        </div>
        <div className="Body">
          <table>
            <thead>
              <tr>
                <th>Pinyin</th>
                <th>Characters</th>
                <th>Meaning</th>
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

    const meaning = this.state.translationCache[pinyin];
    if ("string" === typeof meaning) {
      this.updateCard(editedIndex, { meaning });
    } else {
      this.updateCard(editedIndex, { meaning: "..." }, { pinyin });
      translate(pinyin).then(meaning => {
        this.updateCard(editedIndex, { meaning }, { pinyin });
        this.setState(prevState => ({
          translationCache: {
            ...prevState.translationCache,
            [pinyin]: meaning,
          },
        }));
      });
    }
  }

  onDownload() {}

  onEditDeckName(deckName) {
    this.setState({ deckName });
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
