var budgetcontroller= (function () {

    var expense = function (id, description, value) {
        this.id=id;
        this.description=description;
        this.value= value;
        this.percentage=-1;
    };

    expense.prototype.calcpercentage= function (totalincome) {
        if(totalincome>0)
        {
            this.percentage= Math.round((this.value/totalincome)*100);

        }
        else
        {
            this.percentage=-1;
        }
    };

    expense.prototype.getpercentage= function () {
        return this.percentage;
    };

    var income = function (id, description, value) {
        this.id=id;
        this.description=description;
        this.value= value;
    };

    var calculatetotal = function (type) {
        var total=0;
      data.allitems[type].forEach(function (current,index,array) {
          total=total+current.value;
      });
      data.totals[type]=total;
    };

    var data={
        allitems: //keeping the track of all the entries
            {
             exp:[],
             inc:[]

                },
        totals: //total values of expenses and budget
            {
                exp:0,
                inc:0
            },
        budget:0,
        percentage:-1
    };
    return{
      additem: function (type, des, val) {
          var newitem,ID;
          ID=0; //unique number assigned to each item

          //create new id
          if(data.allitems[type].length>0)
          {
              ID=data.allitems[type][data.allitems[type].length-1].id+1; //gets the id of previous stored entry
          }
          else
          {
              ID=0; //if array is empty its length would be zero
          }


          //create new item
          if(type==='exp')
          {
              newitem= new expense(ID,des,val);
          }
          else{
              newitem= new income(ID,des,val);
          }

          //push it into our data structure
          data.allitems[type].push(newitem);

          return newitem; //returns item with id description and value
      },

        deleteitem:function(type, id)
        { var index, ids;
            ids= data.allitems[type].map(function (current) {
                return current.id;
            });

           index= ids.indexOf(id); //index would be -1 if item we are searching for is not found
           if(index !== -1)
           {
               data.allitems[type].splice(index,1);
           }

        },
        calculatebudget:function () {
          //calculate total income and expenses
            calculatetotal("exp");
            calculatetotal("inc");
            //calculate the budget: income - expenses
            data.budget=data.totals.inc-data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc>0)
            {
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }
            else
            {
                data.percentage=-1;
            }


        },

        calulatepercentage :function()
        {
            data.allitems.exp.forEach(function (current,index,array) {
               current.calcpercentage(data.totals.inc);
            });
        },
        getpercentages :function()
        {
          var allperc = data.allitems.exp.map(function (cur) {
              return cur.getpercentage();
          });
            return allperc;
        },

        getbudget: function () {
            return{
                budget:data.budget,
                percentage:data.percentage,
                totalinc: data.totals.inc,
                totalexp:data.totals.exp
            }
        },

        testing:function () {
          console.log(data);
        }
    };

})();

var UIcontroller =(function () {
    var nodeListforeach = function (list, callback) {
        var len= list.length;
        for(var i = 0; i < len; i++) {
            callback(list[i], i);
        }
    };
    //we create domstrings here so we dont have vo manipulate classes everywhere if we change some class
    //and we pass it to all the modules using class from html
    var formatNumber= function(num, type)
    {
        var dec,sign;
        /* + or - before number
        exactly 2 decimal points
        comma separating the thousands
        2310.467 -> 2,310.46
        2000 -> +2,000
         */

        num= Math.abs(num);
        num=num.toFixed(2);
        dec=num.split('.');
        num=parseFloat(num);
        type === 'exp' ? sign = '-' : sign = '+';
        return sign + ' '+ num.toLocaleString()+'.' + dec[1]

    };
var DOMstrings=
    {
      inputType:  '.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        addbutton:".add__btn",
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetlabel:'.budget__value',
        incomelabel:'.budget__income--value',
        expenselabel:'.budget__expenses--value',
        percentagelabel:'.budget__expenses--percentage',
        container:'.container',
        expensespercentagelabel: '.item__percentage',
        datelabel: '.budget__title--month'

    };
    return {
        getInput: function() {  //we are making function instead of direct object because function is executed only upon calling
            return{
                 type: document.querySelector(DOMstrings.inputType).value,
                 description: document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat( document.querySelector(DOMstrings.inputValue).value)
            };

        },

        addlistitem: function(obj,type) //object itself and type of object expense or income
        {   var html,element,newhtml;

            //create html string with placeholder text
            //we used percentage sign to make text look different from other textss
            if(type==="exp")
            {
                element= DOMstrings.expensesContainer;
                html= '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div>' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div>' +
                    '<div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }
            else if(type==="inc")
            {
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div>' +
                    '<div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }


            //replace placeholder text with actual data
            newhtml= html.replace('%id%',obj.id);
            newhtml= newhtml.replace('%description%',obj.description);
            newhtml= newhtml.replace('%value%',formatNumber(obj.value,type));

            //insert html into DOM
            //adjacent html method
            //4 different positions
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);

        },

        deletelistitem :function(selectorID)
        {

           var el= document.getElementById(selectorID); //selecting that element
           el.parentNode.removeChild(el); //deleting that element
            //we first have to select that element and tha delete it we cannot straight away delete an item
        },

        clearfields:function()
        {
            var fields,fieldsarr;
            fields=document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue); //return a list of selections
            fieldsarr= Array.prototype.slice.call(fields);
            fieldsarr.forEach(function (current,index,array) { //can receive upto three arguments
                current.value="";
            });

            fieldsarr[0].focus(); //sets the focus back onto input field

        },

        //clear budget fields as the app starts
        clearbudgetfields: function()
        {
            document.querySelector(DOMstrings.budgetlabel).textContent= '0.00';
            document.querySelector(DOMstrings.incomelabel).textContent= '+ 0.00';
            document.querySelector(DOMstrings.expenselabel).textContent= '- 0.00';
            document.querySelector(DOMstrings.percentagelabel).textContent= '--- ';

        },
        //displaying the total budget in the top bar of the page
        displaybudget: function(obj)
        {
            var budget= obj.budget;
            if(budget>0)
            {
                document.querySelector(DOMstrings.budgetlabel).textContent=formatNumber(budget,'inc');
            }
            else
                document.querySelector(DOMstrings.budgetlabel).textContent=formatNumber(budget,'exp');


            //donot display negative percentage on page
            if (obj.percentage<=0)
            {
                document.querySelector(DOMstrings.percentagelabel).textContent= "---";
            }
            else
            {
                document.querySelector(DOMstrings.percentagelabel).textContent= obj.percentage + '%';

            }
                document.querySelector(DOMstrings.incomelabel).textContent= formatNumber(obj.totalinc,'inc');
                document.querySelector(DOMstrings.expenselabel).textContent=formatNumber(obj.totalexp,'exp');



        },

        displaypercentages: function(percentages)
        {
            //return a node list
            var fields= document.querySelectorAll(DOMstrings.expensespercentagelabel);
            //creating own foreach method for nodelists


            nodeListforeach(fields, function (current, index) {
                if(percentages[index]>0)
                    current.textContent= percentages[index]+'%';
                else
                    current.textContent= "---";
            });

            },

        displayMonth: function()
        {
            var now,year,month;
             now = new Date();
            year= now.getFullYear();
            month= now.getMonth();
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            month= monthNames[month];

            document.querySelector(DOMstrings.datelabel).textContent= month+', '+year;
        },

        changedtype: function()
        {
            var fields=document.querySelectorAll(
                DOMstrings.inputType+','+ DOMstrings.inputDescription+','+ DOMstrings.inputValue);
            console.log(fields);
            nodeListforeach(fields, function (current) {
                current.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.addbutton).classList.toggle('red');
        },



        getDOMstrings:function () {
            return DOMstrings;

        }

    };


})();

var appcontroller = (function (budgetctrl,UIctrl) {
    UIctrl.clearbudgetfields();
    var EventListeners= function () {
        var DOMstrings=UIctrl.getDOMstrings();
        document.querySelector(DOMstrings.addbutton).addEventListener("click" , additem);
        document.addEventListener('keypress',function (event) {
            if(event.keyCode===13 || event.which===13)
            {
                additem();
            }
        });

        document.querySelector(DOMstrings.container).addEventListener('click', deleteitem);
        document.querySelector(DOMstrings.inputType).addEventListener('change',UIctrl.changedtype);
    };
    var updatebudget= function () {
        //1.calculate the budget
        budgetcontroller.calculatebudget();
        //2. Return the budget
        var budget= budgetcontroller.getbudget();
        //3. Display the budget on the UI
        UIctrl.displaybudget(budget);
    };

    var updatepercentage = function ()
    {
     //1. Calculate percentages
        budgetcontroller.calulatepercentage();
     //2. Read percentages from the budget controller
        var percentages=budgetcontroller.getpercentages();
     //3. update the UI with the new percentages
        UIctrl.displaypercentages(percentages);
    };
    var additem = function() {
        var input,newitem;
        //1.Get data from input UI
        input=UIctrl.getInput();

        if(input.description!=="" && !isNaN(input.value) && input.value>=0)
        {
            //2.Add the item in budget controller
            newitem=budgetcontroller.additem(input.type,input.description,input.value);
            //3.Add the item to the new
            UIctrl.addlistitem(newitem,input.type);
            //4.clear the fields
            UIctrl.clearfields();
            //5.Calculate and update budget
            updatebudget();
            //6.calculate and update percentages
            updatepercentage();
        }

    };

    var deleteitem = function (event) {
        var itemid, splitID,type,id;
        //parentnode is used to get the parent html tag
        itemid=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemid)
        {
            //format of id is inc-1 or exp-1
            //upon calling split on string JS converts primitive to object
            splitID= itemid.split("-"); // return us array of items before and after "-"
            type= splitID[0];
            id= parseInt(splitID[1]);
            //1. delete the item from the data structure
            budgetcontroller.deleteitem(type,id);
            //2. delete the item from user interface
            UIctrl.deletelistitem(itemid);
            //3. update and show the new budget
            updatebudget();
            //4.calculate and update percentages
            updatepercentage();
        }
    };

    return {
        init: function () {
            console.log("Application has started");
            EventListeners();
            UIctrl.displayMonth();
        }
    }


})(budgetcontroller,UIcontroller);

appcontroller.init();