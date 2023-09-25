/*
        商城範例
*/
let products = [
    {
        'id': 1,
        'title': '哈利波特: 神秘的魔法石',
        'price': 250,
        'thumbnail': '_assets/images/harryPotter-1.webp'
    },
    {
        'id': 2,
        'title': '哈利波特: 消失的密室',
        'price': 280,
        'thumbnail': '_assets/images/harryPotter-2.webp'
    },
    {
        'id': 3,
        'title': '哈利波特: 阿茲卡班的逃犯',
        'price': 299,
        'thumbnail': '_assets/images/harryPotter-3.webp'
    }
];
let shop = {
    'allProducts': [],
    'addToCartButtons': [], // 由於此按鈕現在是被 js 加到 HTML 中的, 稍後在 getElements() 中再選擇

    'cartToggle': document.getElementById('cart-toggle'), // 選擇 #cart-toggle, 即展開/關閉購物車的 button
    'productsContainer': document.getElementById('products-container'), // 選擇 #products-container, 即裝有商品的 div
    'addedProductsContainer': document.getElementById('added-products-container'), // 選擇 #added-products-container, 即裝有購物車中商品的 div
    'cartAmount': document.getElementById('cart-amount'), // 選擇 #cart-amount, 即裝有購物車中商品數量的 span
    'cartSubtotal': document.getElementById('cart-subtotal'), // 選擇 #cart-subtotal, 即裝有購物車中商品總價的 span

    'checkoutButton': document.getElementById('checkout-button'), // 先不用選, 最後送出購物車中商品的按鈕
    'cookieName': 'cartItems',
    'urls': {
        'getProducts': 'https://cart-handler.weihaowang.work/api/products',
        'submit': 'https://cart-handler.weihaowang.work/api/cartHandler'
    },
    'cart': {
        'items': [],  // 加入購物車的商品的 id
        'subtotal': 0, // 加入購物車的商品的總價
        'amount': 0    // 加入購物車的商品的數量
    },
    'init': function (productsInCookie) {
        this.fetchProducts(); // 向作業網站請求商品列表
        this.renderElements();
        this.getElements();
        this.addListeners();
        if (productsInCookie) {
            for (let i = 0; i < productsInCookie.length; i++) {
                console.log(productsInCookie[i]);
                this.updateCart(productsInCookie[i]);
            }
        }
    },

    'renderElements': function () {
        for (let i = 0; i < this.allProducts.length; i++) {
            this.productsContainer.innerHTML += `<div class="product" id="product-` + (i + 1) + `">
                <div class="product-thumbnail-wrapper"><img class="product-thumbnail" src="` + this.allProducts[i].thumbnail + `"></div>
                <div class="product-name">` + this.allProducts[i].title + `</div>
                <div class="product-price-wrapper"><span class="product-price">`+ this.allProducts[i].price + `</span> 元</div>
                <button class="add-to-cart-button" productId = "`+ this.allProducts[i].id + `">加入購物車</button>
            </div>`;
        }
    },
    'getElements': function () {
        this.addToCartButtons = document.getElementsByClassName('add-to-cart-button');
    },
    'addListeners': function () {
        /* 2 >>> */
        for (let i = 0; i < this.addToCartButtons.length; i++) {
            this.addToCartButtons[i].addEventListener('click', function () {
                let productId = this.addToCartButtons[i].getAttribute('productId');
                this.updateCart(productId);
            }.bind(this));
        }
        /* <<< 2  */
        /* 3 >>> */
        this.cartToggle.addEventListener('click', function () {
            document.body.classList.toggle('viewing-cart');
        });
        /* <<< 3  */

        if (this.checkoutButton) {
            this.checkoutButton.addEventListener('click', function () {
                this.submit();
            }.bind(this));
        }
    },
    'updateCart': function (p_id) {
        console.log("updateCart(" + p_id + ")");

        for (let i = 0; i < this.allProducts.length; i++) {
            if (this.allProducts[i].id == p_id) {
                /* 4.1 >>> */
                this.cart.items.push(p_id);
                this.cart.subtotal += this.allProducts[i].price;
                this.cart.amount += 1;
                /* <<< 4.1  */
                /* 4.2 >>> */
                this.updateCartUI(this.allProducts[i].title, this.allProducts[i].price);
                /* <<< 4.2  */
                /* 
                    6.
                    更新 cookie 
                    用 setCookie() 將 this.cart.items 存在 cookie 中
                    由於 cookie 的值只能是字串, 我們這裡會使用 JSON.stringify(this.cart.items) 來將陣列準換成文字且保留其格式
                    cookie 名稱儲存在 this.cookieName
                */
                setCookie(this.cookieName, JSON.stringify(this.cart.items));
            }
        }

        console.log(this.cart);
    },
    'updateCartUI': function (p_name, p_price) {
        /* 5.1 >>> */
        this.addedProductsContainer.innerHTML += `<div class="added-product">
            <span class="added-product-title">` + p_name + `</span>
            <span class="added-product-price">` + p_price + `</span>
        </div>`;
        /* <<< 5.1  */
        /* 5.2 >>> */
        this.cartSubtotal.innerText = this.cart.subtotal;
        this.cartAmount.innerText = this.cart.amount;
        /* <<< 5.2  */
    },
    'fetchProducts': function () {
        // 從資料庫請求商品資料
        let request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function () {
            if (request.readyState === 4 && request.status === 200) {
                this.allProducts = JSON.parse(request.responseText);
            }
        }.bind(this));
        request.open('GET', this.urls.getProducts, false);
        request.send();
    },
    'submit': function () {
        // 向資料庫傳送購物車資料
        console.log('submit');
        let request = new XMLHttpRequest();
        request.addEventListener('readystatechange', function () {
            if (request.readyState === 4 && request.status === 200) {
                console.log(request.responseText);
                eraseCookie(this.cookieName); // 成功送出後記得清除 cookie
            }
        }.bind(this));
        request.open('POST', this.urls.submit, true);
        request.setRequestHeader('Content-type', 'application/json');
        let data = {
            'token': '6ed8e10e2f4d23b49255bf444e12a4f7164b972b0c3e46aab7f6e42a6217dbc3',
            'items': this.cart.items,
            'subtotal': this.cart.subtotal,
        }
        data = JSON.stringify(data);
        request.send(data);
    },
}