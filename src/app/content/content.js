import { getState1, register } from "../../state.js";
import { styleHyphenFormat } from "../utils/utils.js";
import bookmarks from "./bookmarks/bookmarks.js";
import tags from "./tags/tags.js";
/* content compoent
 *
 * view to hold the content of bookmarks,tabs,etc.
 */

const STYLE = {
  border: "1px solid black",
  margin: "1rem 0 1rem 0",
  padding: "1rem",
};

const update = () => {
  document.getElementById("content").innerHTML = "";
  create();
};

function create() {
  const isSelected = getState1("navigator.isSelected");
  let view;
  if (document.getElementById("content"))
    view = document.getElementById("content");
  else {
    view = document.createElement("div");
    view.id = "content";
  }

  if (isSelected === "bookmarks") {
    let xx = bookmarks.create();
    view.append(xx);
  } else if (isSelected === "tags") {
    let xx = tags.create();
    view.append(xx);
  }

  Object.assign(view.style, styleHyphenFormat(STYLE));
  return view;
}

register("navigator.isSelected", update);
const content = { create, update };

export default content;
