from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Category(models.Model):
    category_name = models.CharField(max_length = 100)

    def __str__(self):
        return f"Category: {self.category_name}"
    
class Bid(models.Model):
    bid = models.IntegerField(default=0)
    user=models.ForeignKey(User, on_delete=models.CASCADE,blank=True, related_name="userBid")

class Listing(models.Model):
    title = models.CharField(max_length=64)
    image = models.CharField(max_length=1000)
    description = models.TextField()
    price = models.ForeignKey(Bid, on_delete=models.CASCADE, blank=True, null=True,related_name="bidPrice")
    is_active = models.BooleanField(default=True)
    #on_delete=cascade -> if we delete user, this lisitng is deleted as well 
    owner = models.ForeignKey(User, on_delete=models.CASCADE,blank=True, related_name="user")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, blank=True, related_name="category")
    watchfield = models.ManyToManyField(User,blank=True, related_name="listingWatchfield")

    def __str__(self):
        return f"Title: {self.title}"
    
class Comment(models.Model):
    author= models.ForeignKey(User, on_delete=models.CASCADE,blank=True, related_name="userComment")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE,blank=True, related_name="listingComment")
    message = models.CharField(max_length=1000)

    def __str__(self):
        return f"{self.author} comment on {self.listing}"
    
