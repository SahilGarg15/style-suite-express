import { Product } from "@/types/product";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-accent">
              -{discount}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleWishlistToggle}
          >
            <Heart
              className={`h-4 w-4 ${
                inWishlist ? "fill-accent text-accent" : ""
              }`}
            />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button className="w-full" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviews})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          {!product.inStock && (
            <Badge variant="destructive" className="mt-2">
              Out of Stock
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
