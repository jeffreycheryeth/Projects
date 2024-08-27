from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Listing, Category,Comment, Bid


def listing(request, id):
    listingData = Listing.objects.get(pk=id)
    isListingInWatchlist = request.user in listingData.watchfield.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username
    return render(request, "auctions/listing.html",{
        "listing": listingData,
        "isListingInWatchlist": isListingInWatchlist,
        "allComments":allComments,
        "isOwner":isOwner
    })
def closeAuction(request, id):
    listingData= Listing.objects.get(pk=id)
    listingData.is_active=False
    listingData.save()
    isListingInWatchlist = request.user in listingData.watchfield.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username
    return render(request, "auctions/listing.html",{
        "listing": listingData,
        "isListingInWatchlist": isListingInWatchlist,
        "allComments":allComments,
        "isOwner":isOwner,
        "update":True,
        "message":"Bid closed"
    })


def addBid(request, id):
    newBid=request.POST["newBid"]
    listingData = Listing.objects.get(pk=id)
    isListingInWatchlist = request.user in listingData.watchfield.all()
    allComments = Comment.objects.filter(listing=listingData)
    isOwner = request.user.username == listingData.owner.username
    if int(newBid) > listingData.price.bid:
        updateBid = Bid(user=request.user, bid=int(newBid))
        updateBid.save()
        listingData.price = updateBid
        listingData.save()
        return render(request, "auctions/listing.html", {
            "listing":listingData,
            "message":"Bid was updated Successfully",
            "update":True,
            "isListingInWatchlist": isListingInWatchlist,
            "allComments":allComments,
            "isOwner":isOwner,
        })
    else:
        return render(request, "auctions/listing.html", {
            "listing":listingData,
            "message":"Bid was updated failure",
            "update":False,
            "isListingInWatchlist": isListingInWatchlist,
            "allComments":allComments,
            "isOwner":isOwner,
        })
    

def addComment(request, id):
    currentUser = request.user
    listingData = Listing.objects.get(pk=id)
    message = request.POST["newComment"]
    newComment = Comment(author=currentUser, listing=listingData, message=message)
    newComment.save()
    return HttpResponseRedirect(reverse("listing",args=(id, )))

def displayWatchlist(request):
    currentUser = request.user
    listings = currentUser.listingWatchfield.all()
    return render(request, "auctions/watchlist.html", {
        "listings": listings
    })

def removeWatchlist(request, id):
    listingData = Listing.objects.get(pk=id)
    currentUser = request.user
    listingData.watchfield.remove(currentUser)
    return HttpResponseRedirect(reverse("listing",args=(id, )))

def addWatchlist(request, id):
    listingData = Listing.objects.get(pk=id)
    currentUser = request.user
    listingData.watchfield.add(currentUser)
    return HttpResponseRedirect(reverse("listing",args=(id, )))

def index(request):
    active_listings = Listing.objects.filter(is_active=True)
    allCategories = Category.objects.all()
    return render(request, "auctions/index.html",{
        "listings":active_listings,
        "categories": allCategories,
    })

def displayCategory(request):
    if request.method == "POST":
        categoryFromForm = request.POST["category"]
        category = Category.objects.get(category_name=categoryFromForm)
        active_listings = Listing.objects.filter(is_active=True, category=category)
        allCategories = Category.objects.all()
        return render(request, "auctions/index.html",{
            "listings":active_listings,
            "categories": allCategories,
        })


def create_listing(request):
    if request.method == "GET":
        allCategories = Category.objects.all()
        return render(request, "auctions/create.html",{
            "categories": allCategories,
        })
    else:
        title = request.POST["title"]
        image = request.POST["image"]
        description = request.POST["description"]
        price = request.POST["price"]
        category = request.POST["category"]
        print(category)
        categoryData = Category.objects.get(category_name=category)
        currentUser = request.user
        bid = Bid(bid=int(price), user=currentUser)
        bid.save()
        new_listing = Listing(title=title,description=description,image=image,price=bid,category=categoryData,owner=currentUser)
        new_listing.save()

        return HttpResponseRedirect(reverse("index"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
