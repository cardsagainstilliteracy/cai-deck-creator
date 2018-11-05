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
      focusedPinyinInput: 1,
    };
    ["onCreateNewCard", "onEditDeckName", "onDownload"].forEach(
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
                      autoFocus={index === this.state.focusedPinyinInput}
                      onChange={e => this.editCardPinyin(index, e.target.value)}
                      onKeyDown={this.onCreateNewCard}
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
      translate(pinyin).then(meaning => {
        this.setState(
          prevState =>
            prevState.cards[editedIndex].pinyin !== pinyin
              ? prevState
              : {
                  cards: prevState.cards.map(
                    (card, index) =>
                      index === editedIndex ? { ...card, meaning } : card,
                  ),
                },
        );
        this.setState(prevState => ({
          translationCache: {
            ...prevState.translationCache,
            [pinyin]: meaning,
          },
        }));
      });
    }
  }

  onCreateNewCard({ key }) {
    if (key === "Enter") {
      this.setState(prevState => ({
        cards: prevState.cards.concat({
          pinyin: "",
          characters: "",
          meaning: "",
        }),
        focusedPinyinInput: prevState.cards.length,
      }));
    }
  }

  onDownload() {}

  onEditDeckName(deckName) {
    this.setState({ deckName });
  }

  updateCard(editedIndex, changes) {
    this.setState(prevState => ({
      cards: prevState.cards.map(
        (card, index) =>
          index === editedIndex ? { ...card, ...changes } : card,
      ),
    }));
  }
}

export default App;
