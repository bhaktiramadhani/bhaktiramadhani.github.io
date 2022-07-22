const listBook = [];
const RENDER_EVENT = "render-todo";
const STORAGE_KEY = "BOOK";

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("submit-form");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // membuat list
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// fitur ketika berhasil menambakan data dan menghapus kan data
function alertNotification(event, bookId, bookJudul) {
  if (event === "success") {
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Buku berhasil ditambahkan",
      showConfirmButton: true,
      timer: 3000,
      timerProgressBar: true,
    });
  } else if (event === "delete") {
    Swal.fire({
      title: "Anda yakin untuk menghapus buku ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya Hapus",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          position: "center",
          icon: "info",
          title: "tunggu sebentar",
          timer: 2000,
          timerProgressBar: true,
        });
        setTimeout(() => {
          Swal.fire("Terhapus", `${bookJudul} Telah Terhapus`, "success");
          removeBookFromCompleted(bookId);
        }, 2000);
      }
    });
  } else if (event === "edit") {
    Swal.fire({
      title: "Anda yakin untuk mengedit buku ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        editList(bookId);
      }
    });
  }
}
function addBook() {
  const form = document.getElementById("submit-form");
  const inputJudul = document.getElementById("input-judul");
  const inputPenulis = document.getElementById("input-penulis");
  const inputTahun = document.getElementById("input-tahun");
  const randomID = generateRandomID();
  const doneReading = document.getElementById("input-completed");
  const makeObject = generateObject(
    randomID,
    inputJudul.value,
    inputPenulis.value,
    inputTahun.value,
    doneReading.checked
  );

  // for (let i = 0; i < listBook.length; i++) {
  //   const data = listBook[i];
  //   if (data.judul.toLowerCase() != inputJudul.value.toLowerCase()) {
  //     console.log("berhasil");

  //     return;
  //   } else {
  //     Swal.fire("Buku ini sudah ada", "sudah ada", "warning");
  //     return;
  //   }
  // }
  listBook.push(makeObject);
  saveData();
  alertNotification("success");
  document.dispatchEvent(new Event(RENDER_EVENT));
  form.reset();
}

function generateRandomID() {
  return +new Date();
}

function generateObject(id, judul, penulis, tahun, isCompleted) {
  return {
    id,
    judul,
    penulis,
    tahun,
    isCompleted,
  };
}

function makeBook(bookObject) {
  // 1
  const judulBook = document.createElement("h2");
  judulBook.innerText = bookObject.judul;
  // 2
  const penulisBook = document.createElement("p");
  penulisBook.innerText = `Penulis: ${bookObject.penulis}`;
  // 3
  const tahunBook = document.createElement("p");
  tahunBook.innerText = `Tahun: ${bookObject.tahun}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("item");
  textContainer.append(judulBook, penulisBook, tahunBook);

  const container = document.createElement("div");
  container.classList.add("list-item");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const trashButton = document.createElement("button");
    trashButton.classList.add("trash");

    trashButton.addEventListener("click", () => {
      alertNotification("delete", bookObject.id, bookObject.judul);
    });

    const undoButton = document.createElement("button");
    undoButton.classList.add("undo");

    undoButton.addEventListener("click", () => {
      undoBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit");
    editButton.innerText = "Edit";

    editButton.addEventListener("click", () => {
      alertNotification("edit", bookObject.id, bookObject.judul);
    });

    // container button
    const containerButton = document.createElement("div");
    containerButton.classList.add("item-button");
    containerButton.append(editButton, trashButton, undoButton);

    container.append(containerButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check");

    checkButton.addEventListener("click", () => {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash");

    trashButton.addEventListener("click", () => {
      alertNotification("delete", bookObject.id, bookObject.judul);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit");
    editButton.innerText = "Edit";

    editButton.addEventListener("click", () => {
      alertNotification("edit", bookObject.id, bookObject.judul);
    });

    // container button
    const containerButton = document.createElement("div");
    containerButton.classList.add("item-button");
    containerButton.append(editButton, checkButton, trashButton);
    container.append(containerButton);
  }

  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findList(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// fungsi untuk mengedit data yang sudah ada
function editList(bookId) {
  const bookTarget = findList(bookId);
  const bookIndex = findBookIndex(bookId);
  if (bookTarget == null) return;

  const inputJudul = document.getElementById("input-judul");
  const inputPenulis = document.getElementById("input-penulis");
  const inputTahun = document.getElementById("input-tahun");
  const inputCompleted = document.getElementById("input-completed");
  inputJudul.value = bookTarget.judul;
  inputPenulis.value = bookTarget.penulis;
  inputTahun.value = bookTarget.tahun;
  if (bookTarget.isCompleted) {
    inputCompleted.checked = true;
  } else {
    inputCompleted.checked = false;
  }
  listBook.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findList(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  listBook.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in listBook) {
    if (listBook[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

document.addEventListener(RENDER_EVENT, () => {
  const notCompletedTodo = document.getElementById("list-not-completed");
  notCompletedTodo.innerHTML = "";
  const completedTodo = document.getElementById("list-completed");
  completedTodo.innerHTML = "";

  for (const todoItem of listBook) {
    const todoElement = makeBook(todoItem);
    if (!todoItem.isCompleted) {
      notCompletedTodo.append(todoElement);
    } else {
      completedTodo.append(todoElement);
    }
  }
});

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser yang kamu gunakan tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializeData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializeData);

  if (data !== null) {
    for (const list of data) {
      listBook.push(list);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(listBook);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function findList(listId) {
  for (const listItem of listBook) {
    if (listItem.id === listId) {
      return listItem;
    }
  }
  saveData();
  return null;
}

// fitur untuk mencari buku yang sudah ada
const inputSearch = document.getElementById("input-search-judul");
inputSearch.addEventListener("keyup", (event) => {
  setTimeout(() => {
    const notCompletedList = document.getElementById("list-not-completed");
    const completedList = document.getElementById("list-completed");
    notCompletedList.innerHTML = "";
    completedList.innerHTML = "";
    const inputSearchValue = inputSearch.value.toLowerCase();
    for (data of listBook) {
      if (data.judul.toLowerCase().includes(inputSearchValue)) {
        const listElement = makeBook(data);
        if (!data.isCompleted) {
          notCompletedList.append(listElement);
        } else {
          completedList.append(listElement);
        }
      }
    }
  }, 500);
});

document
  .getElementById("form-input-search")
  .addEventListener("submit", (event) => {
    event.preventDefault();
  });
