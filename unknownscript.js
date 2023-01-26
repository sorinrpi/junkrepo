import recipe from "./recipe.js";
import foodItem from "./foodItem.js";


window.greyHighlight = function(id, ishighlight)
{
    if(ishighlight)
    {
        document.getElementById(id).style.backgroundColor = "silver";
    }
    else
    {
        document.getElementById(id).style.backgroundColor = null;
    }
}

var FormatResponse = function(txt)
{
    console.log(`Formatting ${typeof txt}`);
    var objl = null;
    try
    {
        objl = JSON.parse(txt);
    }
    catch (e)
    {
        console.log(e);
        return "";
    }
    console.log(objl);
    var text = "<p>";
    for (const obj of objl)
    {
        for (const elem in obj) {
            console.log(elem);
            console.log(text);
            text += `${elem}: ${obj[elem]}<br/>`;
        }
        text += "<br/>";
    }
    text +="</p>";
    return text;
}

var FormatObject = function(obj, omit=[])
{
    console.log(obj);
    var text = "";
    for (const elem in obj) {
        if(omit.includes(elem))
        {
            console.log(`Omitting ${elem}`);
            continue;
        }
        console.log(elem);
        console.log(text);
        text += `${elem}: ${obj[elem]}\n`;
    }
    return text;
}


var setLiveSearch = function(domelement, text)
{
    //console.log(`Setting value of ${domelement} to ${text}`)
    document.getElementById(domelement).value = text;
}

var FormatLiveResults = function(txt, domElement)
{
    console.log(`Formatting live result: ${txt}`);
    
    var objl = null;
    try
    {
        objl = JSON.parse(txt);
    }
    catch (e)
    {
        console.log(e);
        return "";
    }
    var text = "";
    var i=0;
    for (const obj of objl)
    {
        text += `<p id=quickresult${i} 
                    onmouseover=greyHighlight(this.id,true) 
                    onmouseout=greyHighlight(this.id,false)
                    onclick=setLiveSearch('${domElement}',this.innerHTML)
                    >${obj.name}</p>`;
    }
    return text;
}


window.GetItem = function(item, search, callback)
{
    var queryTerm = document.getElementById(`${item}`);
    if (typeof queryTerm.value === `unknown`)
    {
        return;
    }

    const Http = new XMLHttpRequest();
    var url = "";
    switch (search)
    {
        case "Food":
            url=`https:/${window.location.hostname}/FoodAPI/recipes/food/${queryTerm.value}`;
            break;
        case "Recipe":
            url=`https://${window.location.hostname}/FoodAPI/recipes/${queryTerm.value}`;
            break;
        case "RecipeList":
            url=`https://${window.location.hostname}/FoodAPI/recipes/findr/${queryTerm.value}`;
    }
    console.log(`trying ${url}`);

    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = (e) => {
        console.log(Http.responseText);
        console.log(`received:${Http.responseType}\n${Http.responseText}`);
        callback(Http.responseText);
    }
}


window.GetFood = function()
{
    GetItem("FoodSearch", "Food",(x)=>{
        try{
            var food = new foodItem(JSON.parse(x));
            var placement = document.getElementById(`FoodResults`);
            placement.innerHTML = food.getTableRow();
            }
        catch(e){
            console.log(e);
        }
    });
}

var recipeOnDisplay = null;
window.GetRecipe = function()
{
    GetItem("RecipeSearch", "Recipe",(x)=>{
        //var body = FormatResponse(x);

        var objl = null;
        try
        {
            var rec = JSON.parse(x);
            objl = JSON.parse(rec[0].recipe);
        }
        catch (e)
        {
            console.log(e);
            return "";
        }
        console.log(objl);

        recipeOnDisplay = new recipe(objl);
        var placement = document.getElementById(`RecipeResults`);

        recipeOnDisplay.addTable(placement, ["calories", "fat", "protein", "carbs"]);
    });
}

window.FindRecipes = function(elem)
{
    var queryTerm = document.getElementById(elem);
    if (typeof queryTerm.value === `unknown`)
    {
        return;
    }

    if (queryTerm.value === '')
    {
        var placement = document.getElementById("liveResults");
        placement.innerHTML = '';
        placement.style.border = '0 px';
    }
    else
    {
        GetItem("RecipeSearch", "RecipeList", (x)=>{
            var body = "";
            if (x === '[]')
            {
                body = 'no recipes found...';
            }
            else
            {
                body = FormatLiveResults(x,elem);
            }
            var placement = document.getElementById("liveResults");
            placement.innerHTML = body;
            placement.style.border='1px  solid #A5ACB2';
        });
    }
}
