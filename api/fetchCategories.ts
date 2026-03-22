 const fetchCategories = async (domain: string):
     
      Promise<any> => {
      //const rootpath = store.getState().rootpath.value
      console.log("Domain in fetchCategories: ", domain);
      //const url = `${rootpath}/api/quiz_attempts/find_create/${quiz_id}/${user_id}`;
      const url = `${domain}/api/categories`;
      // const response1 = await fetch(`https://www.tienganhtuyhoa.com/api/categories`);
      console.log("Fetching categories from URL: ", url);
      const response = await fetch(url);
     // console.log("Response......: ", response.json());
      if (!response.ok) throw new Error("Failed to fetch quiz attempt");
      return response.json();
    };

    export default fetchCategories;