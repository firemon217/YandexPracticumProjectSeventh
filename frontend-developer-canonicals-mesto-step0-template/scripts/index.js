import initialCardsFetch from "./cards.js"
import '../pages/index.css';
import fetchServ from "./fetch.js";

window.onload = () =>
{
    //Инициализация переменных элементов
    const placesList = document.querySelector(".places__list")
    const cardTemplate = document.querySelector("#card-template")
    const profilePopup = document.querySelector(".popup_type_edit")
    const cardPopup = document.querySelector(".popup_type_new-card")
    const imagePopup = document.querySelector(".popup_type_image")

    //Инициализация форм
    const forms = Array.from(document.forms)
    const inputList = forms.map(elem => {return Array.from(elem.querySelectorAll(".popup__input"))}).flat()


    //Добавление классов активности
    profilePopup.classList.add("popup_is-animated")
    cardPopup.classList.add("popup_is-animated")
    imagePopup.classList.add("popup_is-animated")

    //Запросы на сервер
    async function start()
    {
        const res = await fetchServ('https://nomoreparties.co/v1/apf-cohort-202/users/me', "GET",
            {
                authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344'
            })
        const profile = document.querySelector(".profile")
        profile.querySelector(".profile__image").style = `background-image: url("${res.avatar}")`
        profile.querySelector(".profile__title").textContent = res.name
        profile.querySelector(".profile__description").textContent = res.about
        appendCard(await initialCardsFetch())
    }

    //Проверка на валидность поля
    function isValid(elem)
    {
        const input = elem.target
        const form = input.closest("form")
        if(!input.validity.valid)
        {
            showInputError(input, form)
        }
        else
        {
            hideInputError(input, form)
        }
    }

    const hasInvalidInput = (inputList) => {
        return inputList.some((inputElement) => {
          return !inputElement.validity.valid;
        })
    };

    const toggleButtonState = (inputList, buttonElement) => {
        if (!hasInvalidInput(inputList)) 
        {
            buttonElement.classList.add('popup__button_active');
        } 
        else 
        {
            buttonElement.classList.remove('popup__button_active');
        }
    };

    //Вывод ошибки поля
    function showInputError(input, form)
    {
        const formError = document.querySelector(`.error-${input.id}`)
        const buttonForm = form.querySelector(".popup__button")
        formError.textContent = input.validationMessage
        input.classList.add("popup__input_error")
        formError.classList.add('popup__error-message_active');
        toggleButtonState(Array.from(form.querySelectorAll("input")), buttonForm)
    }

    //Сокрытие ошибки ввода
    function hideInputError(input, form)
    {
        const formError = document.querySelector(`.error-${input.id}`)
        const buttonForm = form.querySelector(".popup__button")
        input.classList.remove("popup__input_error")
        formError.classList.remove('popup__error-message_active');
        toggleButtonState(Array.from(form.querySelectorAll("input")), buttonForm)
    }

    //Функция для создания карточки из шаблона
    function createCard(obj) {
        const cardCopy = cardTemplate.cloneNode(true).content
        cardCopy.querySelector(".card__image").src = obj.link
        cardCopy.querySelector(".card__title").textContent = obj.name
        cardCopy.querySelector(".card__like").textContent = obj.likes.length
        if(obj.likes.some(elem => {
            return !(elem.name == name)
        }))
        {
            cardCopy.querySelector(".card__like-button").classList.toggle("card__like-button_is-active")
        }
        cardCopy.querySelector(".card__delete-button").addEventListener("click", deleteCard)
        cardCopy.querySelector(".card__like-button").addEventListener("click", likeCard)
        cardCopy.querySelector(".card__image").addEventListener("click", event => {
            openModal(imagePopup)
            imagePopup.querySelector(".popup__image").src = obj.link
            imagePopup.querySelector(".popup__caption").textContent = obj.name
        })
        const card = document.createElement("div")
        card.setAttribute("cardid", obj._id)
        card.classList.add("card-block")
        card.append(cardCopy)
        return card
    }

    async function deleteCard(elem)
    {
        const card = elem.target.closest(".card-block")
        const res = await fetchServ(`https://nomoreparties.co/v1/apf-cohort-202/cards/${card.getAttribute("cardid")}`, "DELETE",
        {
            authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344',
        })
        card.remove()
    }

    async function likeCard(elem)
    {
        const card = elem.target.closest(".card-block")
        if(elem.target.classList.contains("card__like-button_is-active"))
        {
            const res = fetchServ(`https://nomoreparties.co/v1/apf-cohort-202/cards/likes/${card.getAttribute("cardid")}`, "DELETE", 
            {
                authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344',
            })
            elem.target.classList.toggle("card__like-button_is-active")
        }
        else
        {
            const res = fetchServ(`https://nomoreparties.co/v1/apf-cohort-202/cards/likes/${card.getAttribute("cardid")}`, "PUT", 
            {
                authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344',
            })
            elem.target.classList.toggle("card__like-button_is-active")
        }
    }
    
    //Функция для добавления карточек на страницу
    function appendCard(obj, newCard = 0)
    {
        if(!newCard)
        {
            obj.forEach(elem => {
            placesList.append(createCard(elem))
        })
        }
        else
        {
            placesList.prepend(createCard(obj))
        }
    }

    //Открывает модальное окно
    function openModal(popup) {      
        popup.classList.add('popup_is-opened');
    }

    //Закрывает модальное окно
    function closeModal(popup)
    {
        popup.classList.remove('popup_is-opened');
    }

    //Обработчки отправки формы профиля
    async function handleProfileFormSubmit(event) {
        event.preventDefault()
        if(event.target.classList.contains("popup__button_active"))
        {
            const res = await fetchServ('https://nomoreparties.co/v1/apf-cohort-202/users/me', "PATCH",
            {
                authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344',
                'Content-Type': 'application/json'
            }, 
            JSON.stringify({
                name: profilePopup.querySelector(".popup__input_type_name").value,
                about: profilePopup.querySelector(".popup__input_type_description").value
            }))
            document.querySelector(".profile__title").textContent = res.name
            document.querySelector(".profile__description").textContent = res.about
            closeModal(profilePopup)
        }

    }

    //Обработчки отправки формы создания карточки
    async function handleCardFormSubmit(event)
    {
        event.preventDefault()
        if(event.target.classList.contains("popup__button_active"))
        {
            let name = cardPopup.querySelector(".popup__input_type_card-name").value
            let link = cardPopup.querySelector(".popup__input_type_url").value
            cardPopup.querySelector(".popup__input_type_card-name").value = ""
            cardPopup.querySelector(".popup__input_type_url").value = ""
            const res = await fetchServ("https://nomoreparties.co/v1/apf-cohort-202/cards", "POST", {
                authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344',
                'Content-Type': 'application/json'
            },
            JSON.stringify({
                name: name,
                link: link
            })
            )
            appendCard(res, 1)
            closeModal(cardPopup)
        }
    }

    //Добавление событий кликов на элементы
    document.querySelector(".profile__edit-button").addEventListener("click", event => {
        openModal(profilePopup)
        profilePopup.querySelector(".popup__input_type_name").value = document.querySelector(".profile__title").textContent
        profilePopup.querySelector(".popup__input_type_description").value = document.querySelector(".profile__description").textContent
    })

    profilePopup.querySelector(".popup__close").addEventListener("click", event => {
        closeModal(profilePopup)
    })

    profilePopup.querySelector(".popup__button").addEventListener("click", handleProfileFormSubmit)

    document.querySelector(".profile__add-button").addEventListener("click", event => {
        openModal(cardPopup)
    })

    cardPopup.querySelector(".popup__close").addEventListener("click", event => {
        closeModal(cardPopup)
    })

    cardPopup.querySelector(".popup__button").addEventListener("click", handleCardFormSubmit)

    imagePopup.querySelector(".popup__close").addEventListener("click", event => {
        closeModal(imagePopup)
    })

    //События валидации ввода
    inputList.forEach(elem => {
        elem.addEventListener("change", isValid)
    })


    //Начальная иницилизация карточек
    start()
}