import { getChildren } from "./utils.js";
import { setState1, getState1, bookmarkAdded } from "../../state.js";
import { updateBookmarkTags, deleteTags } from "./tag.js";
/**
 * module to encapsulate chrome extension API
 */
const FOLDER = "pinecone"; //the default folder to query bookmarks

export async function getBookmarks(folder) {
  const search = folder ? folder : FOLDER;
  let nodes = await chrome.bookmarks.search(search);
  let node = nodes.filter((bookmark) => !bookmark.url)[0]; //suppose the 1st one that matched
  let xx = await chrome.bookmarks.getSubTree(node.id);
  return xx[0];
}

export async function getSubtree(id) {
  return await chrome.bookmarks.getSubTree(id);
}
export async function getBookmarksByID(nodeId) {
  let node = await chrome.bookmarks.get(nodeId);
  return node;
}

export async function createBookmark(details) {
  let node = await chrome.bookmarks.create(details);
  return node;
}

export async function updateBookmark(details) {
  const { id, url, title } = details;

  return await chrome.bookmarks.update(id, { url, title });
}

export async function moveBookmark(details) {
  const { id, selectedFolderId } = details;

  return await chrome.bookmarks.move(id, { parentId: selectedFolderId });
}
export async function removeBookmark(details) {
  const { id } = details;
  return await chrome.bookmarks.remove(id);
}

export const compareNodes = (a, b) => {
  if ((a.url && b.url) || (!a.url && !b.url)) {
    return a.dateAdded > b.dateAdded ? 1 : -1;
  }

  if (a.url && !b.url) {
    return 1;
  }
  if (!a.url && b.url) {
    return -1;
  }
};
//storage api
export async function setUserData(obj) {
  return await chrome.storage.local.set(obj);
}

export async function getUserData(key) {
  return await chrome.storage.local.get(key);
}

//listen to chrome bookmark updated
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  const { action } = request;
  let message;
  switch (action) {
    case "create": {
      message = createHandler(request);
      break;
    }
    case "delete": {
      message = await deleteHandler(request);
      break;
    }
    case "change": {
      message = changeHandler(request);
      break;
    }
    case "move": {
      message = await moveHandler(request);
      break;
    }
  }

  sendResponse(message);
});

const createHandler = (request) => {
  const { bookmark } = request; //updated bookmark id
  //check if it belongs to the selected workspace
  const bks = getState1("bookmarks.bks");
  const parent = getChildren(bks, bookmark.parentId);
  //if parent found, then update the workspace bookmark tree
  if (parent) {
    bookmarkAdded();
    return { farewell: "workspace bookmarks updated" };
  } else {
    return { farewell: "do nothing" };
  }
};

async function deleteHandler(request) {
  const { id } = request;
  const bks = getState1("bookmarks.bks");
  const isSelectedNodeId = getState1("bookmarks.isSelected");

  //if workspace folder get deleted
  if (id == bks.id) {
    //clear workspace info in localStorage,and reload the app
    await setUserData({ easyDashboard: "" });
    window.location.reload();
  } else {
    const removedBookmark = getChildren(bks, id);

    if (removedBookmark) {
      if (
        id == isSelectedNodeId ||
        getChildren(getChildren(bks, id), isSelectedNodeId)
      ) {
        //if the current selected folder or its parent is deleted, then show the root
        setState1("bookmarks.isSelected", bks.id);
      }
      bookmarkAdded();
      return { farewell: "workspace bookmarks updated" };
    } else {
      return { farewell: "do nothing" };
    }
  }
}

const changeHandler = (request) => {
  const { id } = request;
  const bks = getState1("bookmarks.bks");
  const changedBookmark = getChildren(bks, id);
  if (changedBookmark) {
    bookmarkAdded();
    return { farewell: "workspace bookmarks updated" };
  } else {
    return { farewell: "do nothing" };
  }
};

async function moveHandler(request) {
  const { id, moveInfo } = request;
  const { parentId, oldParentId } = moveInfo;
  const bks = getState1("bookmarks.bks");
  const moveIn = getChildren(bks, parentId) ? true : null;
  const moveOut = getChildren(bks, oldParentId) ? true : null;
  //check if the new parentId or old parentId belongs to the workspace
  let farewell = { farewell: "workspace bookmarks updated" };
  if (moveIn && moveOut) {
    //bookmark moved inside workspace
    bookmarkAdded();
  } else if (moveIn && !moveOut) {
    bookmarkAdded();
    await updateBookmarkTags(await getSubtree(id), []);
  } else if (!moveIn && moveOut) {
    await deleteTags(id);
    bookmarkAdded();
  } else {
    farewell = { farewell: "do nothing" };
  }
  return farewell;
}
