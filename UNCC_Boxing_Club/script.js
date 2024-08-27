'use strict'

const leftBtn = document.querySelector('.left');
const rightBtn = document.querySelector('.right');

const carouselItems = Array.from(document.querySelectorAll('.carousel-item'));
const navItems = Array.from(document.querySelectorAll('.nav-item'));
const CAROUSEL_SIZE= carouselItems.length;

const tablinks = document.querySelectorAll('.tablinks');
const tabcontent = document.querySelectorAll('.tabcontent');
tablinks.forEach((tab,index)=>{tab.addEventListener('click', function (e){
    tabcontent.forEach(tab=>{
        tab.style.display="none";
    });
    tablinks.forEach(tab=>{
        tab.classList.remove('active');
    });
        tabcontent[index].style.display='block';
        e.currentTarget.classList.add('active');
})
});


const carouselNav = document.querySelector('.carousel-nav');

carouselNav.addEventListener('click',e=>{
    const currentItem = document.querySelector('.carousel-item.active');
    const currentNavItem = document.querySelector('.nav-item.active');
    const index = navItems.indexOf(e.target);
    const next = carouselItems[index];
    if(e.target.classList.contains('active')){
        return;
    }
    else{
        currentItem.classList.remove('active');
        currentNavItem.classList.remove('active');
        e.target.classList.add('active');
        next.classList.add('active');
    }
});

leftBtn.addEventListener('click',swipe);
rightBtn.addEventListener('click',swipe);

function swipe(e){
    const currentCarouselItem = document.querySelector('.carousel-item.active');
    const currentIndex = carouselItems.indexOf(currentCarouselItem);
    let nextIndex;
    if(e.currentTarget.classList.contains('left')){
        if(currentIndex === 0){
            nextIndex= CAROUSEL_SIZE-1;
        }
        else{
            nextIndex=currentIndex-1;
        }
    }
    else{
        if(currentIndex === CAROUSEL_SIZE-1){
            nextIndex= 0;
        }
        else{
            nextIndex=currentIndex+1;
        }
    }
    carouselItems[nextIndex].classList.add('active');
    navItems[nextIndex].classList.add('active');
    currentCarouselItem.classList.remove('active');
    navItems[currentIndex].classList.remove('active');
}

const root = document.documentElement;
const button = document.querySelectorAll('.accordion-label');

button.forEach(button=>{
    button.addEventListener('click', buttonClick);
});



function buttonClick(e){
    const btn = e.target;
    //console.log(btn);
    btn.classList.toggle('open');
    btn.nextElementSibling.classList.toggle('open');
    //console.log(btn.nextElementSibling);
    root.style.setProperty('--content-height', btn.nextElementSibling.scrollHeight + 'px');
    button.forEach(buttn=>{
        if(buttn != btn && buttn.classList.contains('open')){
            buttn.classList.remove('open');
            buttn.nextElementSibling.classList.remove('open');
        }
    });
}

const url = "https://openboxing.org/api/champions/all.json";
const form = document.getElementById("searchForm");
form.addEventListener("submit", function(e){
    e.preventDefault();
    getChampion();
});

const errorContainer = document.querySelector('.error');
function showError(message){
    errorContainer.textContent = message;
    if(errorContainer.classList.contains('hidden')){
        errorContainer.classList.remove('hidden');
    }
}

async function getChampion(e){
    try{
        const response = await fetch(url);
        if(!response.ok){
            throw Error(`Error: ${response.url} ${response.statusText}`);
        }
        const champions = await response.json();
        showChampions(champions);
    } catch(error){
        showError(error.message);
    }
}
function showChampions(champions){
    //console.log(champions);
   const year = document.getElementById('boxing-year').value;
   let championsInYear = [];
   for(let i = 0; i < champions.length; i++){
    const champion = champions[i];
    const Cyear =  champion.born.substring(0,4);
    if(Cyear === year){
        championsInYear.push(champion);
    }
   }
   if(championsInYear.length > 0){
    const champInfo = championsInYear.map(champion=>{
        return `<p class="boxingpara"><strong>Name: </strong> ${champion.name.first} ${champion.name.last}</p>
        <p class="boxingpara"><strong>Born:</strong> ${champion.born}</p><br>`;
    }).join("");
    document.getElementById('champion-info').innerHTML = champInfo;
   }
   else{
    document.getElementById('champion-info').innerHTML = "<p><strong>No champions found for the given year.</strong></p>"; 
   }
}

