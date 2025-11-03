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
      visibleStart: { type: Number },
      perPage: { type: Number },
      copied: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.foxCards = [];
    this.visibleStart = 0;
    this.perPage = 5;
    this.copied = false;
  }
  async firstUpdated() {
    const params = new URLSearchParams(window.location.search);
    const foxParam = parseInt(params.get("fox"));

    await this._loadFoxData();

    if (foxParam && foxParam >= 1 && foxParam <= this.foxCards.length) {
      this.visibleStart = foxParam - 1;
    }

    this._ensureVisibleImages();
  }

  updated(changedProps) {
    if (changedProps.has("visibleStart")) {
      this._ensureVisibleImages();
    }
  }
  async _loadFoxData() {
    try {
      const response = await fetch("/foxes.json");
      const data = await response.json();

      // JSON should look like: [ { "id": 1 }, { "id": 2 }, ... ]
      this.foxCards = data.map(item => ({
        id: item.id,
        url: "",
        likes: 0,
        dislikes: 0,
        loaded: false,
      }));
    } catch (e) {
      console.warn("Failed to load fox data, fallback to static 51", e);
      this.foxCards = Array.from({ length: 51 }, (_, i) => ({
        id: i + 1,
        url: "",
        likes: 0,
        dislikes: 0,
        loaded: false,
      }));
    }
  
  like(id) {
    this._updateReaction(id, "likes");
  }

  dislike(id) {
    this._updateReaction(id, "dislikes");
  }

  _updateReaction(id, field) {
    this.foxCards = this.foxCards.map(card =>
      card.id === id ? { ...card, [field]: card[field] + 1 } : card
    );
  }

  async copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?fox=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }

  nextPage() {
    const nextStart = this.visibleStart + this.perPage;
    if (nextStart < this.foxCards.length) {
      this.visibleStart = nextStart;
    }
  }

  prevPage() {
    const prevStart = Math.max(0, this.visibleStart - this.perPage);
    this.visibleStart = prevStart;
  }
  _ensureVisibleImages() {
    const end = Math.min(this.visibleStart + this.perPage, this.foxCards.length);
    const updated = [...this.foxCards];
    for (let i = this.visibleStart; i < end; i++) {
      const card = updated[i];
      if (!card.loaded) {
        updated[i] = {
          ...card,
          url: `https://randomfox.ca/images/${card.id}.jpg`,
          loaded: true,
        };
      }
    }
    this.foxCards = updated;
  }

  _getVisibleCards() {
    const end = Math.min(this.visibleStart + this.perPage, this.foxCards.length);
    return this.foxCards.slice(this.visibleStart, end);
  }
  
  _renderCard(card) {
    return html`
      <div class="card">
        <h3>Fox #${card.id}</h3>
        ${card.url
          ? html`<img src="${card.url}" alt="Fox ${card.id}" />`
          : html`<div class="placeholder">Loading fox...</div>`}

        <div class="actions">
          <button class="like" @click="${() => this.like(card.id)}">Like</button>
          <span>${card.likes}</span>
          <button class="dislike" @click="${() => this.dislike(card.id)}">Dislike</button>
          <span>${card.dislikes}</span>
        </div>

        <button class="share" @click="${() => this.copyLink(card.id)}">Copy Share Link</button>
        ${this.copied ? html`<div class="copied-msg">Link copied!</div>` : ""}
      </div>
    `;
  }

  _renderNav() {
    return html`
      <div class="nav">
        <button class="nav-btn" @click="${this.prevPage}" ?disabled="${this.visibleStart === 0}">
          ⟨
        </button>
        <button
          class="nav-btn"
          @click="${this.nextPage}"
          ?disabled="${this.visibleStart + this.perPage >= this.foxCards.length}"
        >
          ⟩
        </button>
      </div>
    `;
  }

  render() {
    const cards = this._getVisibleCards();
    return html`
      <header>Some Random Foxes</header>
      ${this._renderNav()}
      <div class="gallery">
        ${cards.map(card => this._renderCard(card))}
      </div>
    `;
  }
  static get styles() {
    return [super.styles, css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(120deg, #8ee4af, #379683);
        font-family: 'Verdana', sans-serif;
        color: #fff;
      }

      header {
        font-size: 1.8rem;
        margin: 20px 0;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
      }

      .gallery {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
        width: 90%;
      }

      .card {
        background: #05386b;
        border-radius: 14px;
        padding: 12px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        text-align: center;
      }

      .card img {
        width: 100%;
        border-radius: 10px;
      }

      .actions {
        display: flex;
        justify-content: space-around;
        margin-top: 8px;
      }

      button {
        cursor: pointer;
        border: none;
        border-radius: 6px;
        padding: 6px 12px;
      }

      .like {
        background: #5cdb95;
        color: #05386b;
      }

      .dislike {
        background: #379683;
        color: #fff;
      }

      .share {
        background: #edf5e1;
        color: #05386b;
        margin-top: 8px;
      }

      .copied-msg {
        color: #5cdb95;
        font-size: 0.8rem;
        margin-top: 4px;
      }

      .nav {
        display: flex;
        justify-content: space-between;
        width: 200px;
        margin: 16px 0;
      }

      .nav-btn {
        background: #05386b;
        color: #fff;
        font-size: 1.4rem;
        width: 50px;
        height: 50px;
        border-radius: 10px;
      }

      .nav-btn:disabled {
        opacity: 0.3;
      }
    `];
  }
}

customElements.define(Project1.tag, Project1);

}
customElements.define(Project1.tag, Project1);
