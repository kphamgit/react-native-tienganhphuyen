const fetchSubCategories = async (domain: string | undefined, id: string):
      Promise<any> => {
      //const rootpath = store.getState().rootpath.value
      //const url = `${rootpath}/api/quiz_attempts/find_create/${quiz_id}/${user_id}`;
      //const domain1 = 'https://kphamenglish-f26e8b4d6e4b.herokuapp.com'
      
      const url = `${domain}/api/categories/${id}/sub_categories`;
      console.log("fetchSubCategories url=", url)
 
      const response = await fetch(url);
     
      if (!response.ok) throw new Error("Failed to fetch quiz attempt");
      return response.json();
    };

    export default fetchSubCategories;