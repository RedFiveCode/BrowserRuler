class Shared {
    // shared utility method for getting and setting values on controls

    static selectListValue(document, id, key) {
        var element = document.getElementById(id);
        if (element) {
            Array.from(element.options).forEach(function (option, index) {
                if (option.id === key) {
                    console.log(`Id ${id} : index=${index}, key=${key}, value=${option.value}`);
                    element.selectedIndex = index;
                    return;
                }
            });
        }
        else {
            console.log(`Id ${id} : not found`);
        }
    }

    static getListValue(document, id) {
        var element = document.getElementById(id);
        if (element) {
            console.log(`Id ${id} : value=${element.value}, index=${element.selectedIndex}, id=${element[element.selectedIndex].id}`);
    
            return element[element.selectedIndex].id;
        }
    
        console.log(`Id ${id} : not found`);
        return null;
    }

    static setSliderValue(document, id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.value = value ? 1 : 0;
            console.log(`set value: ${value}, element.value: ${element.value}`);
        }
        else {
            console.log(`Id ${id} : not found`);
        }
    }

    static getSliderValue(document, id) {
        var element = document.getElementById(id);
        if (element) {
    
            console.log(`get element.value: ${element.value}`);
            return element.value === '1' ? true : false;
        }
        else {
            console.log(`Id ${id} : not found`);
            return false;
        }
    }

    static setElementColour(document, id, colour) {
        const element = document.getElementById(id);
        if (element) {
            console.log(`Updating ${id} to ${colour}`);

            element.innerText = colour;
            element.style.color = colour;
        }
        else {
            console.log(`Element id ${id} not found`); 
        }
    }
}
