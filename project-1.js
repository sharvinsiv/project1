/**
 * Copyright 2025 sharvinsiv
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";
import "@haxtheweb/simple-icon/lib/simple-icon-lite.js";
import "@haxtheweb/simple-icon/lib/simple-icons.js";

export class Project1 extends DDDSuper(I18NMixin(LitElement)) {
  static get tag() {
    return "project-1";
  }

  static get properties() {
    return {
      ...super.properties,
      foxCards: { type: Array },
      likes: { type: Object },
      dislikes: { type: Object },
      onscreenStart: { type: Number },
      cardsPerPage: { type: Number },
      linkCopied: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.foxCards = [];
    this.likes = {};
    this.dislikes = {};
    this.onscreenStart = 0;
    this.cardsPerPage = 6;
    this.linkCopied = false;
    this.imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            this.imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadFoxCards();
    this.loadReactions();
  }

  updated() {
    const lazyImages = this.renderRoot.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => this.imageObserver.observe(img));
  }

  loadReactions() {
    const savedLikes = localStorage.getItem("foxLikes");
    const savedDislikes = localStorage.getItem("foxDislikes");
    if (savedLikes) this.likes = JSON.parse(savedLikes);
    if (savedDislikes) this.dislikes = JSON.parse(savedDislikes);
  }

  saveReactions() {
    localStorage.setItem("foxLikes", JSON.stringify(this.likes));
    localStorage.setItem("foxDislikes", JSON.stringify(this.dislikes));
  }

  async loadFoxCards() {
    const users = [
      { name: "Lena Fox", avatar: "https://i.pravatar.cc/100?img=1" },
      { name: "Marcus Hill", avatar: "https://i.pravatar.cc/100?img=2" },
      { name: "Jin Park", avatar: "https://i.pravatar.cc/100?img=3" },
      { name: "Ava Stone", avatar: "https://i.pravatar.cc/100?img=4" },
      { name: "Theo Brown", avatar: "https://i.pravatar.cc/100?img=5" },
      { name: "Sofia Cruz", avatar: "https://i.pravatar.cc/100?img=6" },
      { name: "Ben Rivers", avatar: "https://i.pravatar.cc/100?img=7" },
      { name: "Isla Gray", avatar: "https://i.pravatar.cc/100?img=8" },
      { name: "Owen Lee", avatar: "https://i.pravatar.cc/100?img=9" },
      { name: "Maya Fields", avatar: "https://i.pravatar.cc/100?img=10" },
    ];

    const foxCount = 51;
    this.foxCards = Array.from({ length: foxCount }, (_, i) => {
      const user = users[i % users.length];
      return {
        id: i + 1,
        image: `https://randomfox.ca/images/${i + 1}.jpg`,
        name: user.name,
        avatar: user.avatar,
      };
    });
  }

  like(id) {
    this.likes[id] = (this.likes[id] || 0) + 1;
    this.saveReactions();
    this.requestUpdate();
  }

  dislike(id) {
    this.dislikes[id] = (this.dislikes[id] || 0) + 1;
    this.saveReactions();
    this.requestUpdate();
  }

  async copyLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?fox=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      this.linkCopied = true;
      setTimeout(() => (this.linkCopied = false), 1500);
    } catch (err) {
      console.error("Couldn't copy link:", err);
    }
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

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: linear-gradient(120deg, #7be3a8, #3fcf9e);
          min-height: 100vh;
          font-family: var(--ddd-font-navigation, "Verdana", sans-serif);
          color: #fff;
          box-sizing: border-box;
          padding: 20px;
        }

        header {
          font-size: 1.8rem;
          font-weight: bold;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
          margin-bottom: 16px;
        }

        .gallery {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          max-width: 1100px;
        }

        .card {
          width: 100%;
          max-width: 280px;
          background: #fff;
          border-radius: 14px;
          color: #222;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease-in-out;
        }

        .card:hover {
          transform: scale(1.02);
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f5f5f5;
          border-bottom: 1px solid #ddd;
        }

        .profile img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .profile span {
          font-weight: 600;
          font-size: 1rem;
        }

        .image-container {
          width: 100%;
          height: 220px;
          background: #eee;
          overflow: hidden;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .actions {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid #ddd;
        }

        button {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #333;
          font-size: 1rem;
          transition: transform 0.15s ease;
        }

        button:hover {
          transform: scale(1.1);
        }

        .likes-count,
        .dislikes-count {
          font-size: 0.9rem;
          font-weight: bold;
        }

        .share {
          background: #00796b;
          color: #fff;
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          margin: 8px auto 14px;
          transition: opacity 0.2s ease;
        }

        .share:hover {
          opacity: 0.85;
        }

        .copied-msg {
          text-align: center;
          font-size: 0.9rem;
          color: #0c7b1f;
          margin-bottom: 8px;
        }

        .nav-btns {
          display: flex;
          justify-content: space-between;
          width: 200px;
          margin: 20px 0;
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
      `,
    ];
  }

  renderCard(card) {
    return html`
      <div class="card">
        <div class="profile">
          <img src="${card.avatar}" alt="${card.name}" />
          <span>${card.name}</span>
        </div>

        <div class="image-container">
          <img data-src="${card.image}" src="" alt="Fox ${card.id}" />
        </div>

        <div class="actions">
          <button @click="${() => this.like(card.id)}" title="Like">
            <simple-icon-lite icon="favorite"></simple-icon-lite>
            <span class="likes-count">${this.likes[card.id] || 0}</span>
          </button>

          <button @click="${() => this.dislike(card.id)}" title="Dislike">
            <simple-icon-lite icon="thumb-down"></simple-icon-lite>
            <span class="dislikes-count">${this.dislikes[card.id] || 0}</span>
          </button>
        </div>

        <button class="share" @click="${() => this.copyLink(card.id)}">
          Copy Fox Link
        </button>

        ${this.linkCopied
          ? html`<div class="copied-msg">Link copied to clipboard!</div>`
          : ""}
      </div>
    `;
  }

  render() {
    const end = Math.min(
      this.onscreenStart + this.cardsPerPage,
      this.foxCards.length
    );
    const visibleCards = this.foxCards.slice(this.onscreenStart, end);

    return html`
      <header>Project 1: Fox Gallery</header>

      <div class="nav-btns">
        <button
          class="nav-btn"
          @click="${this.prevSet}"
          ?disabled="${this.onscreenStart === 0}"
        >
          ⟨
        </button>
        <button
          class="nav-btn"
          @click="${this.nextSet}"
          ?disabled="${this.onscreenStart + this.cardsPerPage >=
          this.foxCards.length}"
        >
          ⟩
        </button>
      </div>

      <div class="gallery">
        ${visibleCards.map((card) => this.renderCard(card))}
      </div>
    `;
  }
}

customElements.define(Project1.tag, Project1);
