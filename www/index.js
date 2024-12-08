"use strict";
import { capitalize } from "./utils/helpers.js";

const api = "http://localhost:3000";
let selectedCategoryId = undefined;

function printSites(data) {
  console.log("data received: ", data);
  const parent = document.getElementsByTagName("tbody")[0];
  parent.innerHTML = null; // reset elements

  // CREATE ROWS
  // Create modal once
  const modalHTML = `
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Delete</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this site?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" id="delete-btn" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modalDeleteButton = document.getElementById("delete-btn");

  data.sites.forEach((site, index) => {
    const row = document.createElement("tr");
    const date = new Date(site.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const rowHTML = `
            <tr id="${site.id}">
                <th>${index + 1}</th>
                <td class="url-link">${site.url}</td>
                <td>${site.user}</td>
                <td>${formattedDate}</td>
            </tr>
        `;

    row.insertAdjacentHTML("beforeend", rowHTML);

    const urlCell = row.querySelector(".url-link");
    urlCell.onclick = () => {
      window.open(site.url, "_blank");
    };

    //actions
    const actionsCell = document.createElement("td");

    //link
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "btn blue-btn";
    openButton.insertAdjacentHTML(
      "beforeend",
      '<i class="bi bi-box-arrow-up-right"></i>'
    );
    openButton.onclick = () => {
      window.open(site.url, "_blank");
    };

    //delete

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn red-btn";
    deleteButton.setAttribute("data-bs-toggle", "modal");
    deleteButton.setAttribute("data-bs-target", "#exampleModal");
    deleteButton.innerHTML = '<i class="bi bi-trash3"></i>';
    deleteButton.onclick = () => {
      modalDeleteButton.setAttribute("data-site-id", site.id);
    };

    modalDeleteButton.onclick = () => {
      const siteId = modalDeleteButton.getAttribute("data-site-id");
      fetch(`${api}/sites/${siteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((resp) => {
          if (resp.ok) {
            console.log("borrado correctamente");
          } else {
            console.error("error al procesar peticion");
            throw new Error("Error al procesar petición");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error:", error);
        })
        .finally(() => {
          fetchSitesByCategory();
          //close the modal
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("exampleModal")
          );
          modal.hide();
        });
    };

    //edit
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn";
    editButton.insertAdjacentHTML("beforeend", '<i class="bi bi-pen"></i>');
    editButton.onclick = () =>
      (window.location.href = `newsite.html#${selectedCategoryId}-${site.id}`);

    actionsCell.appendChild(openButton);
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);

    parent.appendChild(row);
  });
}

function setupAddCategoryButton() {
  const addCategoryBtn = document.getElementById("addCatBtn");
  addCategoryBtn.onclick = handleAddCategoryClick;
}

function handleAddCategoryClick() {
  const categoryName = getCategoryNameInput();
  if (!categoryName) {
    alert("Please enter a category name");
    return;
  }
  if (categoryName.length < 3) {
    alert("Category name must be at least 3 characters");
    return;
  }
  if (categoryName.length > 15) {
    alert("Category name must be less than 15 characters");
    return;
  }
  createCategory(categoryName)
    .then((data) => {
      console.log("New category created:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Error when creating new category");
    })
    .finally(() => {
      closeCategoryModal();
      fetchAllCategories();
      document.getElementById("categoryName").value = "";
    });
}

function getCategoryNameInput() {
  return document.getElementById("categoryName").value;
}

function createCategory(name) {
  return fetch(`${api}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    console.error("Failed to create new category");
    return res.json().then((err) => {
      throw new Error(err.message || "Unknown error");
    });
  });
}

function closeCategoryModal() {
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("staticBackdrop")
  );
  modal.hide();
}

function printCategories(data) {
  setupAddSiteButton();
  resetCategoryList();
  data.forEach(renderCategory);
}

function setupAddSiteButton() {
  const addSiteButton = document.getElementById("addSiteButton");
  addSiteButton.onclick = () => {
    if (!selectedCategoryId) {
      alert("Please select a category first");
      return;
    }
    window.location.href = `newsite.html#${selectedCategoryId}`;
  };
}

function resetCategoryList() {
  const parent = document.getElementsByTagName("ul")[0];
  parent.innerHTML = ""; // Clear the list
}

function renderCategory(category) {
  if (!category || !category.name) return;

  const parent = document.getElementsByTagName("ul")[0];
  const listElement = createCategoryElement(category);

  parent.appendChild(listElement);
}

function createCategoryElement(category) {
  const container = document.createElement("div");
  container.className = "d-flex";

  const child = createCategoryLink(category);
  const deleteCatBtn = createDeleteButton(category);

  container.appendChild(child);
  container.appendChild(deleteCatBtn);

  const listElement = document.createElement("li");
  listElement.className = "nav-item";
  listElement.appendChild(container);

  return listElement;
}

function createCategoryLink(category) {
  const child = document.createElement("a");
  child.innerText = capitalize(category.name);
  child.className = `nav-link ${
    category.id === selectedCategoryId ? "active" : ""
  }`;
  child.onclick = () => {
    selectedCategoryId = category.id;
    fetchAllCategories();
    fetchSitesByCategory();
  };
  return child;
}

const categoryModalHTML = `
  <div class="modal fade" id="categoryDeleteModal" tabindex="-1" aria-labelledby="categoryDeleteModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="categoryDeleteModalLabel">Delete Category</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this category?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" id="category-delete-btn" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", categoryModalHTML);
const categoryModalDeleteButton = document.getElementById(
  "category-delete-btn"
);

function createDeleteButton(category) {
  const deleteCatBtn = document.createElement("button");
  deleteCatBtn.type = "button";
  deleteCatBtn.className = "btn red-btn";
  deleteCatBtn.innerHTML = '<i class="bi bi-trash3"></i>';
  deleteCatBtn.setAttribute("data-bs-toggle", "modal");
  deleteCatBtn.setAttribute("data-bs-target", "#categoryDeleteModal");
  deleteCatBtn.onclick = () => {
    categoryModalDeleteButton.setAttribute("data-category-id", category.id);
  };
  return deleteCatBtn;
}

categoryModalDeleteButton.onclick = () => {
  const categoryId = categoryModalDeleteButton.getAttribute("data-category-id");
  fetch(`${api}/categories/${categoryId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })
    .then((resp) => {
      if (resp.ok) {
        console.log("Category deleted successfully");
      } else {
        console.error("Error processing request");
        throw new Error("Error processing request");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(`Error: ${error}`);
    })
    .finally(() => {
      fetchAllCategories();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("categoryDeleteModal")
      );
      modal.hide();
    });
};

function fetchSitesByCategory() {
  fetch(`${api}/categories/${selectedCategoryId ?? 1}`, {
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => printSites(data))
    .catch((error) => {
      console.error("Error:", error);
      alert("Could not retrieve sites from category");
      printSites([]);
    });
}

function fetchAllCategories() {
  fetch(`${api}/categories`, {
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => printCategories(data))
    .catch((error) => {
      console.error("Error:", error);
      alert("Could not retrieve all categories");
      printCategories([]);
    });
}

window.onload = function () {
  if (selectedCategoryId) {
    fetchSitesByCategory();
  }
  fetchAllCategories();
  setupAddCategoryButton();
};
