import { getBookmarks, getSubtree } from "../src/app/utils/chrome.js";
let state = {
  workspace: {
    isSelected: null,
  },
  navigator: { isSelected: "bookmarks" },
  bookmarks: {
    bks: null,
    isSelected: null,
    editBar: {
      current: null, //add,edit,delete
      add: {
        isFolder: false,
        active: false,
      },
      edit: {
        editing: null,
        active: false,
      },
      delete: {
        deleting: null,
        active: false,
      },
    },
    path: [],
  },
  tabs: {},
  notes: {},
};

let listener = {
  navigator: [],
  bookmarks: [],
};

let lis = {
  workspace: {
    listener: [],
    isSelected: {
      listener: [],
    },
  },
  navigator: {
    listener: [],
    isSelected: {
      listener: [],
    },
  },
  bookmarks: {
    isSelected: {
      listener: [],
    },
    bks: {
      listener: [],
    },
    listener: [],
    editBar: {
      current: {
        listener: [],
      },
      add: {
        isFolder: {
          listener: [],
        },
        listener: [],
      },
      edit: {
        editing: { listener: [] },
        active: { listener: [] },

        listener: [],
      },
      delete: {
        deleting: { listener: [] },
        listener: [],
        active: { listener: [] },
      },
    },
    path: {
      listener: [],
    },
  },
};

export const register = (key, callback) => {
  const path = key.split(".");
  const res = path.reduce((pre, cur) => {
    return pre[cur];
  }, lis);

  res.listener.push(callback);
};

export const setState1 = (path, value) => {
  const parts = path.split(".");
  const limit = parts.length - 1;
  let xx = {};
  for (let i = 0; i < limit; ++i) {
    const key = parts[i];

    xx = xx[key] ?? state[key];
  }
  const key = parts[limit];
  xx[key] = value;
  const cbs = parts.reduce((pre, cur) => {
    return pre[cur];
  }, lis);

  cbs &&
    cbs.listener &&
    cbs.listener.forEach((cb) => {
      cb();
    });
};

export const getState1 = (key) => {
  const parts = key.split(".");
  const cbs = parts.reduce((pre, cur) => {
    return pre[cur];
  }, state);
  console.log(state);
  return structuredClone(cbs); //keep state immutable
};

//each time adding/deleting bookmark, sych the latest bk tree with chrome
export const bookmarkAdded = () => {
  const wsId = getState1("workspace.isSelected");
  getSubtree(wsId).then((nodes) => {
    setState1("bookmarks.bks", nodes[0]);
  });
};
