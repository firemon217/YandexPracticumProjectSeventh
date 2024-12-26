import fetchServ from "./fetch";

  //База данных карточек
  async function initialCardsFetch()
  {
    const card = await fetchServ('https://nomoreparties.co/v1/apf-cohort-202/cards', "GET",
      {
          authorization: '78ff2729-e14a-4ee0-9fa2-b5de86fbe344'
      });
    return card
  }

export default initialCardsFetch