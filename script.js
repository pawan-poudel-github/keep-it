/**
 * Function to select a single HTML element using a CSS selector.
 * @param {string} selector - The CSS selector used to select the element.
 * @returns {HTMLElement| HTMLInputElement | null} The selected HTML element, or null if no element matches the selector.
 */
function $(selector) {
    return document.querySelector(selector);
}

/**
 * Function to select HTML elements using a CSS selector.
 * @param {string} selector - The CSS selector used to select the elements.
 * @returns {HTMLElement[] | null} An array of selected HTML elements, or null if no elements match the selector.
 */
function $all(selector) {
    return document.querySelectorAll(selector);
}


function LoadNotes() {
    let oldNotes = JSON.parse(localStorage.getItem("notes")) || [];

    oldNotes.forEach((oldNote) => {
        addNoteToCointainer(oldNote)
    });
}

LoadNotes()

let newNote = {
    id: "",
    title: "",
    description: "",
    images: [],
    color: "#ffffff",
};

let newNoteTitle = $("#new-note-title");
let newNoteDescription = $("#new-note-description")
newNoteTitle.onchange = () => { newNote.title = newNoteTitle.value }
newNoteDescription.onchange = () => { newNote.description = newNoteDescription.value }
newNoteTitle.onclick = () => {
    $(".take-a-note").classList.add("active");
};


$all(".color").forEach((item) => {
    item.onclick = (e) => {
        newNote.color = e.target.value;
        $(".take-a-note").style.backgroundColor = e.target.value;
    };
});



$("#image").onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        const parentElement = $(".add-more-content .images");
        const output = document.createElement("div");
        output.classList.add("image");

        let image = document.createElement("img");
        image.src = reader.result;
        image.alt = "Can't Load Image";
        let id = generateUniqueId()
        output.setAttribute("data-upload-image-id", id)
        parentElement.appendChild(output);
        output.appendChild(image);
        output.innerHTML += `<button class="remove-image" title="Remove" type="button" onclick="RemoveUploadImage('${id}')">&#10539;</button>`;
        newNote.images.push(
            { id, url: reader.result }
        );
        adjustColumnCount();
    };
    reader.readAsDataURL(e.target.files[0]);
};


function RemoveUploadImage(id) {
    const imageId = id;
    newNote.images = newNote.images.filter(image => image.id !== imageId);
    $(`[data-upload-image-id="${id}"]`).remove();
    adjustColumnCount()
}
let editing = false;


$(".submit-btn").onclick = () => {
    if (newNoteTitle.value.trim() || $("#new-note-description").value.trim()) {
        // Check if newNote.id exists to determine if it's an existing note being edited
        if (newNote.id) {
            // Update existing note
            const existingNotes = JSON.parse(localStorage.getItem("notes")) || [];
            const updatedNotes = existingNotes.map(note => {
                if (note.id === newNote.id) {
                    note.title = newNote.title;
                    note.description = newNote.description;
                    note.images = newNote.images;
                    note.color = newNote.color;
                }
                return note;
            });
            localStorage.setItem("notes", JSON.stringify(updatedNotes));

            // Update the note in the DOM
            const noteElement = $(`[data-id="${newNote.id}"]`);
            if (noteElement) {
                const titleElement = noteElement.querySelector("h3");
                const descriptionElement = noteElement.querySelector("p");
                titleElement.textContent = newNote.title;
                descriptionElement.textContent = newNote.description;
                noteElement.style.backgroundColor = newNote.color;
                // Update images if any
                const imagesWrapper = noteElement.querySelector(".images");
                if (imagesWrapper) {
                    imagesWrapper.innerHTML = ""; // Clear existing images
                    newNote.images.forEach(image => {
                        let imgWrapper = document.createElement("div");
                        imgWrapper.classList.add("image");
                        let img = document.createElement("img");
                        img.src = image.url;
                        img.alt = "Note img";
                        img.setAttribute("data-saved-image-id", image.id);
                        imgWrapper.appendChild(img);
                        imgWrapper.innerHTML += `<button class="remove-image" onClick="DeletedSavedImage('${image.id}')" title="Remove" type="button">&#10539;</button>`;
                        imagesWrapper.appendChild(imgWrapper);
                    });
                    adjustColumnCount();
                }
            }
        } else {
            // Create new note
            newNote.id = generateUniqueId();
            newNote.title = newNoteTitle.value;
            newNote.description = $("#new-note-description").value;

            const noteList = JSON.parse(localStorage.getItem("notes")) || [];
            noteList.push(newNote);
            localStorage.setItem("notes", JSON.stringify(noteList));

            addNoteToCointainer(newNote);
        }

        // Reset the form
        resetAddNote();
    } else {
        alert("Nothing to add");
    }
};




function generateUniqueId(prefix = "id") {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${randomStr}`;
}

function addNoteToCointainer(noteInfo) {
    let note = document.createElement("div");
    note.className = "note";
    note.setAttribute("data-id", noteInfo.id);
    note.style.backgroundColor = noteInfo.color;
    let h3 = document.createElement("h3");
    h3.textContent = noteInfo.title;
    let p = document.createElement("p");
    p.textContent = noteInfo.description;
    p.placeholder = "Description";

    note.innerHTML += ` <button class="delete-note" title="Delete note" onClick="DeleteNote('${noteInfo.id}')">&#10006;</button>`
    note.innerHTML += `<button class="edit-note" onclick="EditNote('${noteInfo.id}')" title="Edit note">&#9998;</button>`
    note.appendChild(h3);

    if (noteInfo.images.length > 0) {
        let imagesWrapper = document.createElement("div")
        imagesWrapper.classList.add("images")
        noteInfo.images.length == 1 ? imagesWrapper.style.columnCount = 1 : imagesWrapper.style.columnCount = 2
        noteInfo.images.forEach(image => {
            let imgWrapper = document.createElement("div")
            imgWrapper.classList.add("image")
            let img = document.createElement("img")
            img.src = image.url
            img.alt = "Note img";
            img.setAttribute("data-saved-image-id", image.id)

            imgWrapper.appendChild(img)
            imagesWrapper.appendChild(imgWrapper)
            imgWrapper.innerHTML += `<button class="remove-image" onClick="DeletedSavedImage('${image.id}')" title="Remove" type="button">&#10539;</button>`

            note.appendChild(imagesWrapper)

        })
    }

    note.appendChild(p);
    $(".saved-notes").appendChild(note);
}

function adjustColumnCount() {
    const parent = $(".add-more-content .images");
    const childrenCount = parent.childElementCount;
    const columnCount = childrenCount == 1 ? 1 : 2;

    $(".add-more-content .images").style.columnCount = columnCount;
}

function resetAddNote() {
    newNote.id = "";
    newNote.title = "";
    newNote.description = "";
    newNote.images = [];
    newNote.color = "#ffffff";
    newNoteTitle.value = "";
    $("#new-note-description").value = "";
    $(".take-a-note").classList.remove("active");

    $(".take-a-note").style.backgroundColor = newNote.color;
    let imagesContainer = $(".add-more-content .images");
    while (imagesContainer.firstChild) {
        imagesContainer.removeChild(imagesContainer.firstChild);
    }

}


function DeletedSavedImage(imageId) {
    const removeImage = confirm("Are you sure to remove Image?");
    if (removeImage) {
        const noteId = document.querySelector(`[data-saved-image-id="${imageId}"]`).closest(".note").dataset.id;

        let oldNotes = JSON.parse(localStorage.getItem("notes"));

        let noteToUpdate = oldNotes.find(note => note.id === noteId);

        noteToUpdate.images = noteToUpdate.images.filter(image => image.id !== imageId);

        localStorage.setItem("notes", JSON.stringify(oldNotes));

        document.querySelector(`[data-saved-image-id="${imageId}"]`).closest(".image").remove();
        const imagesWrappers = document.querySelectorAll(".saved-notes .images");
        imagesWrappers.forEach(wrapper => {
            const childrenCount = wrapper.childElementCount;
            const columnCount = childrenCount === 1 ? 1 : 2;
            wrapper.style.columnCount = columnCount;
        });
    }
}




function DeleteNote(id) {

    const confirmDelete = confirm("Are you sure to delete note ?");
    if (confirmDelete) {

        const noteId = id;

        $(`[data-id=${noteId}]`).remove();

        let existingNotes = JSON.parse(localStorage.getItem("notes"));
        let updatedNotes = existingNotes.filter(note => note.id !== noteId);
        localStorage.setItem("notes", JSON.stringify(updatedNotes));
    }
}


function EditNote(id) {
    console.log(id);
    const noteId = id;
    const existingNotes = JSON.parse(localStorage.getItem("notes"));
    const noteToEdit = existingNotes.find(note => note.id === noteId);
    if (noteToEdit) {
        // Retrieve the title and description from the note
        const title = noteToEdit.title;
        const description = noteToEdit.description;

        // Set the title and description in the input fields
        $("#new-note-title").value = title;
        $("#new-note-description").value = description;

        // Set the newNote object to the edited note's data
        newNote.id = noteId;
        newNote.title = title;
        newNote.description = description;
        newNote.images = noteToEdit.images;
        newNote.color = noteToEdit.color;

        // Display the edit note form
        $(".take-a-note").classList.add("active");

        // Set the background color of the form
        $(".take-a-note").style.backgroundColor = noteToEdit.color;

        // Add image elements to the form for each image in the note
        const parentElement = $(".add-more-content .images");
        parentElement.innerHTML = ""; // Clear previous images
        noteToEdit.images.forEach(image => {
            const output = document.createElement("div");
            output.classList.add("image");
            let img = document.createElement("img");
            img.src = image.url;
            img.alt = "Note img";
            img.setAttribute("data-upload-image-id", image.id);
            output.appendChild(img);
            output.innerHTML += `<button class="remove-image" title="Remove" type="button" onclick="RemoveUploadImage('${image.id}')">&#10539;</button>`;
            parentElement.appendChild(output);
        });

        // Adjust the column count
        adjustColumnCount();
    }
}
