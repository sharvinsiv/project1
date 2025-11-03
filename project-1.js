/**
 * Copyright 2025 sharvinsiv
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

export class Project1 extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "project-1";
  }

  static get properties() {
    return {
      ...super.properties,
      foxCards: { type: Array },
      onscreenStart: { type: Number },
      linkCopied: { type: Boolean },
      cardsPerPage: { type: Number },
    };
  }

  constructor() {
    super();
    this.onscreenStart = 0;
    this.linkCopied = false;
    this.cardsPerPage = 5;
    this.foxCards = Array.from({ length: 51 }, (_, i) => ({
      id: i + 1,
      url: "",
      likes: 0,
      dislikes: 0,
      imageload: false,
    }));
  }

  static get styles() {
    return [super.styles, css`
      :host {
        min-height: 100vh;
        font-family: 'Verdana', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: linear-gradient(120deg, #7be3a8, #3fcf9e);
      }

      header {
        color: #fff;
        font-size: 1.7rem;
        margin: 24px 0;
        text-shadow: 1px 1px 4px rgba(0,0,0,0.25);
      }

      .gallery {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
        align-items: start;
        margin-bottom: 20px;
      }

      .fox-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-radius: 18px;
        box-shadow: 0 6px 14px rgba(0,0,0,0.2);
        background: #20c18b;
        padding: 16px;
        text-align: center;
      }

      .fox-card img {
        width: 100%;
        border-radius: 12px;
        object-fit: cover;
      }

      .placeholder {
        font-style: italic;
        margin: 12px 0;
        color: #7a4d32;
      }

      .actions {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 6px;
      }

      .like-btn, .dislike-btn {
        font-weight: bold;
        cursor: pointer;
        padding: 6px 12px;
        background: #333;
        color: #fff;
        border-radius: 6px;
        border: none;
      }

      .like-btn:hover, .dislike-btn:hover, .share-btn:hover {
        opacity: 0.8;
      }

      .share-btn {
        cursor: pointer;
        background: #00796b;
        color: #fff;
        border-radius: 6px;
        border: none;
        padding: 6px 12px;
        margin-top: 6px;
      }

      .copied-msg {
        margin-top: 4px;
        font-size: 0.8rem;
        color: #0c7b1f;
      }

      .nav-btns {
        display: flex;
        justify-content: space-between;
        width: 200px;
        margin-bottom: 24px;
      }

      .nav-btn {
        cursor: pointer;
        font-size: 1.8rem;
        width: 50px;
        height: 50px;
        border-radius: 10px;
        border: none;
        background: #2b1600;
        color: #fff;
      }

      .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    `];
  }

  firstUpdated() {
    const params = new URLSearchParams(window.location.search);
    const foxNum = parseInt(params.get("fox"));
    if (foxNum >= 1 && foxNum <= 51) {
      this.onscreenStart = foxNum - 1;
    }
    this.loadVisibleFoxes();
  }

  updated(changedProps) {
    if (changedProps.has("onscreenStart")) {
      this.loadVisibleFoxes();
    }
  }

  loadVisibleFoxes() {
    const end = Math.min(this.onscreenStart + this.cardsPerPage, this.foxCards.length);
    for (let i = this.onscreenStart; i < end; i++) {
      const card = this.foxCards[i];
      if (!card.imageload) {
        const updated = [...this.foxCards];
        updated[i] = { ...card, url: `https://randomfox.ca/images/${card.id}.jpg`, imageload: true };
        this.foxCards = updated;
      }
    }
  }

  like(id) {
    this.foxCards = this.foxCards.map(c =>
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    );
  }

  dislike(id) {
    this.foxCards = this.foxCards.map(c =>
      c.id === id ? { ...c, dislikes: c.dislikes + 1 } : c
    );
  }

  nextSet() {
    if (this.onscreenStart + this.cardsPerPage < this.foxCards.length) {
      this.onscreenStart += this.cardsPerPage;
    }
  }

  prevSet() {
    if (this.onscreenStart - this.cardsPerPage >= 0) {
      this.onscreenStart -= this.cardsPerPage;
    } else {
      this.onscreenStart = 0;
    }
  }

  async copyingtheLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?fox=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 1500);
    } catch (err) {
      console.error("Couldn't get the link", err);
    }
  }

  renderCard(card) {
    return html`
      <div class="fox-card">
        <h3>Fox Number #${card.id}</h3>
        ${card.url 
          ? html`<img src="${card.url}" alt="Fox ${card.id}" />`
          : html`<div class="placeholder">Loading some foxes...</div>`}

        <div class="actions">
          <button class="like-btn" @click="${() => this.like(card.id)}">Like The Fox</button>
          <span>${card.likes}</span>
          <button class="dislike-btn" @click="${() => this.dislike(card.id)}">Dislike The Fox</button>
          <span>${card.dislikes}</span>
        </div>

        <button class="share-btn" @click="${() => this.copyingtheLink(card.id)}">Copy The Fox</button>
        ${this.linkCopied ? html`<div class="copied-msg">Fox Copied!</div>` : ""}
      </div>
    `;
  }

  render() {
    const end = Math.min(this.onscreenStart + this.cardsPerPage, this.foxCards.length);
    const visibleCards = this.foxCards.slice(this.onscreenStart, end);

    return html`
      <header>some random fox pics</header>
      <div class="nav-btns">
        <button class="nav-btn" @click="${this.prevSet}" ?disabled="${this.onscreenStart === 0}">⟨</button>
        <button class="nav-btn" @click="${this.nextSet}" ?disabled="${this.onscreenStart + this.cardsPerPage >= this.foxCards.length}">⟩</button>
      </div>
      <div class="gallery">
        ${visibleCards.map(card => this.renderCard(card))}
      </div>
    `;
  }
}

customElements.define(Project1.tag, Project1);
