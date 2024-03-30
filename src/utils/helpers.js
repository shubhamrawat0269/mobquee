export const getData = async (url) => {
  try {
    const data = await fetch(url);
    return await data.json();
  } catch (error) {
    console.log(error);
  }
};

export const putData = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const res = await response.json();
    // enter you logic when the fetch is successful
    console.log(res);
  } catch (error) {
    // enter your logic for when there is an error (ex. error toast)

    console.log(error);
  }
};
