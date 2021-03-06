import navigator from "./app/navigator/navigator.js";
import content from "./app/content/content.js";
import setting from "./app/setting/setting.js";
import {
  setUserData,
  getUserData,
  getSubtree,
  getBookmarks,
} from "./app/utils/chrome.js";
import { setState1 } from "../src/state.js";

function init() {
  getUserData(["easyDashboard"]).then((userData) => {
    if (
      !(userData.easyDashboard && userData.easyDashboard.bookmarks.isSelected)
    ) {
      document.getElementById("container").append(setting.create());
    } else {
      const isSelectedNodeId = userData.easyDashboard.bookmarks.isSelected.id;

      getSubtree(isSelectedNodeId).then((bkNodes) => {
        setState1("bookmarks.bks", bkNodes[0]);
        setState1("bookmarks.path", [bkNodes[0]]);
        setState1("bookmarks.isSelected", isSelectedNodeId);
        setState1("workspace.isSelected", isSelectedNodeId);
        document.getElementById("container").append(navigator.create());
        document.getElementById("container").append(content.create());
      });
    }
  });
}

init();
