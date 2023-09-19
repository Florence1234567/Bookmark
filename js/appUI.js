//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let categories = [];
let selectedCategory = "all";
let index = 0;
Init_UI();

function Init_UI() {
    renderContacts();

    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        renderContacts();
    });
}

function renderDropdownMenu() {
    $("#menu").empty();
    $("#menu").append(
        $(`
                <div class="dropdown-item" id="all"> Toutes les catégories </div>
                <div class="dropdown-divider"></div>
                `))

    $('#all').on("click", function () {
        selectedCategory = "all";
        renderContacts();
    });

    categories.forEach(category => {
        $("#menu").append(
            $(`<div class= "dropdown-item" id="${category}"> ${category} </div>`))

        $(`#${category}`).on("click", function () {
            selectedCategory = category;
            renderContacts();
        });
    });

    $("#menu").append(
        $(`
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" id="aboutCmd">
                    <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
                </div>
                `))

    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}

async function renderContacts() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createContact").show();
    $("#abort").hide();
    let bookmarks = await Contacts_API.Get();
    eraseContent();
    if (bookmarks !== null) {
        bookmarks.forEach(bookmark => {
            let inArray = categories.includes(bookmark.Category);
            if (!inArray) {
                categories[index] = bookmark.Category;
                index++;
            }

            $("#content").append(renderContact(bookmark));
        });

        renderDropdownMenu();

        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditContactForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}

function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}

function eraseContent() {
    $("#content").empty();
}

function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}

function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}

function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}

function renderCreateContactForm() {
    renderContactForm();
}

async function renderEditContactForm(id) {
    showWaitingGif();
    let bookmark = await Contacts_API.Get(id);
    if (bookmark !== null)
        renderContactForm(bookmark);
    else
        renderError("Contact introuvable!");
}

async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await Contacts_API.Get(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${bookmark.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <div class="contactTitle">${bookmark.Title}</div>
                        <div class="contactUrl">${bookmark.Url}</div>
                        <div class="contactCategory">${bookmark.Category}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await Contacts_API.Delete(bookmark.Id);
            if (result)
                renderContacts();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderContacts();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}

function newContact() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}

function loadFavicon(url) {
    $("#favicon").empty();
    var request = new XMLHttpRequest;
    request.open('GET', url, true);
    request.send();
    request.onreadystatechange = function(){
        console.log(request);
        if(request.readyState == 4){
            console.log("success");
            $("#favicon").append(
                $(`
                    <img style="height: 60px; float: left; margin-right: 8px;"
                    src="http://www.google.com/s2/favicons?sz=32&domain=${url}" />
                `))
        }else{
            console.log("failure");
            $("#favicon").append(
                $(`
                    <img style="height: 60px; float: left; margin-right: 8px;"
                    src="bookmark.svg" />
                `))
        }
    }
    /*$.ajax({
        url: url,
        success: jsonData => { console.log("success") },
        error: function (jqXHR) { console.log("failure") }
    });*/    
}

function renderContactForm(bookmark = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newContact();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="contactForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
                <div id="favicon">
                </div>
                        <br>
                        <br>
                        <br>
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">URL </label>
            <input
                type="url"
                class="form-control"
                name="Url"
                id="Url"
                placeholder="URL"
                required
                RequireMessage="Veuillez entrer un URL" 
                InvalidMessage="Veuillez entrer un URL valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control Alpha"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);

    $('#Url').on("change", function () {
        var url = document.getElementById("Url").value;
        loadFavicon(url);
    });

    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#contactForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await Contacts_API.Save(bookmark, create);
        if (result)
            renderContacts();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderContacts();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderContact(bookmark) {
    if (selectedCategory == "all" || bookmark.Category == selectedCategory) {
        return $(`
     <div class="contactRow" contact_id=${bookmark.Id}">
        <div class="contactContainer noselect">
            <div class="contactLayout">
                <div>
                    <img style="height: 32px; float: left; margin-right: 8px;"
                        src="http://www.google.com/s2/favicons?sz=32&domain=${bookmark.Url}" />
                    <span class="contactTitle">${bookmark.Title}</span>
                </div>
                <span class="contactCategory">${bookmark.Category}</span>
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
    }
}