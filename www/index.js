"use strict";
import { capitalize } from "./utils/helpers.js";
import { apiCalls } from "./apiCalls.js";
import { errorToast, successToast } from "./utils/helpers.js";

const apiUrl = "http://localhost:3000";
const api = new apiCalls(apiUrl);

let selectedCategoryId = undefined;
let categoryIcons = {};

function printSiteData(data) {
  //console.log("data received: ", data);
  const parent = document.getElementsByTagName("tbody")[0];
  parent.innerHTML = null; // reset elements

  // CREATE ROWS
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
      api
        .delete(`sites/${siteId}`)
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
          successToast("Site deleted successfully");
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
      (window.location.href = `newsite.html#${selectedCategoryId}/${site.id}`);

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

function setupIconSelection() {
  const categoryIcons = document.querySelectorAll(".dropdown-item[data-icon]");
  const selectedIconInput = document.getElementById("selectedIcon");
  const selectedValueInput = document.getElementById("selectedValue");
  const dropdownButton = document.getElementById("iconDropdown");

  categoryIcons.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const iconClass = this.getAttribute("data-icon");

      selectedIconInput.value = iconClass;
      selectedValueInput.value = iconClass;
      dropdownButton.innerHTML = `<i class="${iconClass}"></i> ${iconClass}`;
    });
  });
}

function handleAddCategoryClick() {
  const categoryName = getCategoryNameInput();
  const selectedIcon = document.getElementById("selectedIcon").value;

  console.log("selectedIcon: ", selectedIcon);

  if (!categoryName) {
    //alert("Please enter a category name");
    errorToast("Please enter a category name");
    return;
  }
  if (categoryName.length < 3) {
    //alert("Category name must be at least 3 characters");
    errorToast("Category name must be at least 3 characters");
    return;
  }
  if (categoryName.length > 15) {
    //alert("Category name must be less than 15 characters");
    errorToast("Category name must be less than 15 characters");
    return;
  }
  createCategory(categoryName)
    .then((data) => {
      if (selectedIcon) {
        categoryIcons[data.id] = selectedIcon;
      }
      //console.log("New category created:", data);
      successToast("New category created");
    })
    .catch((error) => {
      console.error("Error:", error);
      //alert("Error when creating new category");
      errorToast("Error when creating new category");
    })
    .finally(() => {
      closeCategoryModal();
      fetchAllCategories();
      resetCategoryForm();
    });
}

function resetCategoryForm() {
  document.getElementById("categoryName").value = "";
  document.getElementById("selectedIcon").value = "";
  document.getElementById("selectedValue").value = "";
  document.getElementById("iconDropdown").innerHTML = "Pick an icon";
}

function getCategoryNameInput() {
  return document.getElementById("categoryName").value;
}

function createCategory(name) {
  return api.post("categories", { name }).then((res) => {
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
      errorToast("Please select a category first");
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
  const icon = categoryIcons[category.id];
  child.innerHTML = `${icon ? `<i class="${icon}"></i> ` : ""}${capitalize(
    category.name
  )}`;
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
  api
    .delete(`categories/${categoryId}`)
    .then((resp) => {
      if (resp.ok) {
        console.log("Category deleted successfully");
        successToast("Category deleted successfully");
      } else {
        console.error("Error processing request");
        throw new Error("Error processing request");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      errorToast(`Error: ${error}`);
    })
    .finally(() => {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("categoryDeleteModal")
      );
      modal.hide();
      fetchAllCategories();
    });
};

function fetchSitesByCategory() {
  api
    .get(`categories/${selectedCategoryId}`)
    .then((res) => res.json())
    .then((data) => printSiteData(data))
    .catch((error) => {
      console.error("Error:", error);
      errorToast("Could not get the sites from this category");
      printSiteData([]);
    });
}

function fetchAllCategories() {
  api
    .get("categories")
    .then((res) => res.json())
    .then((data) => {
      printCategories(data);
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
      errorToast("Could not get all categories");
      printCategories([]);
    });
}

window.onload = function () {
  if (selectedCategoryId) {
    fetchSitesByCategory();
  }
  fetchAllCategories();
  setupAddCategoryButton();
  setupIconSelection();
};
