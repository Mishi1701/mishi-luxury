import { useCart } from "@/hooks/useCart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, X, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const SlideOutCart = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  const formatPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md border-l border-primary/20 bg-background p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <SheetTitle className="font-display text-lg flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Royal Cart
            <span className="ml-auto font-body text-xs text-muted-foreground">{totalItems} items</span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
              <Crown className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="font-body text-sm text-muted-foreground text-center">
              Your royal cart awaits treasures worthy of your crown.
            </p>
            <button
              onClick={closeCart}
              className="font-body text-xs font-semibold tracking-wider uppercase text-primary hover:underline"
            >
              Explore the Empire
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border border-border/50 bg-muted/10 hover:border-primary/20 transition-colors"
                >
                  <div className="w-20 h-20 rounded-md bg-gradient-to-br from-lavender/40 to-teal-light/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl opacity-30">👑</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-semibold text-foreground line-clamp-1">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">{item.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-border/50 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted/30 transition-colors rounded-l-md"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-body text-xs font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted/30 transition-colors rounded-r-md"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-body text-sm font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 px-6 py-5 space-y-4 bg-muted/5">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs tracking-wider uppercase text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-bold text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Taxes & shipping calculated at checkout
              </p>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="block w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-bold tracking-widest uppercase rounded-sm text-center shimmer hover:scale-[1.02] transition-transform"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={closeCart}
                className="block w-full py-2.5 font-body text-xs font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SlideOutCart;
