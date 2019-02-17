// const root = document.documentElement;

import {
  html,
  Component,
  render
} from "https://unpkg.com/htm/preact/standalone.mjs";
const localStorageKeys = {
  THEME: "theme"
};
let state = {
  checklist: {}
};
let data = [];

function toggleDarkTheme() {
  if (document.body.classList.contains("theme-dark")) {
    document.body.classList.remove("theme-dark");
    themeToggle.checked = false;
    localStorage.setItem(localStorageKeys.THEME, "light");
  } else {
    document.body.classList.add("theme-dark");
    themeToggle.checked = true;
    localStorage.removeItem(localStorageKeys.THEME);
  }
}
themeToggle.addEventListener("change", e => {
  toggleDarkTheme();
});

function renderOnElement(component, element) {
  if (element) {
    render(component, element);
  }
}
function setState(obj) {
  state = { ...state, ...obj };
  renderComponents();
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

class SearchResults extends Component {
  constructor() {
    super();
    this.state = {
      results: [],
      isLoading: false
    };
    this.search = debounce(this.search, 500);
  }
  search(term) {
    console.log(term);
    this.setState({ isLoading: true });
    if (!term || term.length < 3) {
      // lastSearchResultHash = '';
      return;
    }

    var matchingItems = data.filter(item => {
      if ((item.name + "").toLowerCase().indexOf(term) !== -1) {
        return true;
      }
    });
    this.setState({
      results: matchingItems,
      isLoading: false
    });
  }
  componentDidMount() {
    window.searchTerm.addEventListener("input", e => {
      this.search(e.target.value);
    });
  }
  render() {
    return html`
      <div>
        <p>${this.state.isLoading ? "Loading..." : ""}</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reporting Link</th>
            </tr>
          </thead>
          ${this.state.results.map(result => {
            return html`
              <tr>
                <td>${result.name}</td>
                <td>
                  <a
                    aria-label=${`Reporting link for ${result.name}`}
                    href=${result.reportingLink}
                    >Report Link</a
                  >
                </td>
              </tr>
            `;
          })}
        </table>
      </div>
    `;
  }
}

function renderComponents() {
  renderOnElement(
    html`
      <${SearchResults} />
    `,
    window.preactRoot
  );
}

function init() {
  if (localStorage.getItem(localStorageKeys.THEME) === "light") {
    toggleDarkTheme();
  }
  fetch("_data/list.json")
    .then(res => res.json())
    .then(res => (data = res));

  renderComponents();
}
document.addEventListener("DOMContentLoaded", init);
