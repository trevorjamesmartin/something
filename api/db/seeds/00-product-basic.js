exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("product")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("product").insert([
        {
          id: 1,
          name: "Jack Herer",
          image_url: "https://images.leafly.com/flower-images/jack-herer.jpg",
          description:
            'also known as "JH," "The Jack," "Premium Jack," and "Platinum Jack" is a sativa-dominant marijuana strain that has gained as much renown as its namesake, the marijuana activist and author of The Emperor Wears No Clothes. Combining a Haze hybrid with a Northern Lights #5 and Shiva Skunk cross, Sensi Seeds created Jack Herer hoping to capture both cerebral elevation and heavy resin production. Its rich genetic background gives rise to several different variations of Jack Herer, each phenotype bearing its own unique features and effects. However, consumers typically describe this 55% sativa hybrid as blissful, clear-headed, and creative. Jack Herer was created in the Netherlands in the mid-1990s, where it was later distributed by Dutch pharmacies as a recognized medical-grade strain. Since then, this spicy, pine-scented strain has taken home numerous awards for its quality and potency. Many breeders have attempted to cultivate this staple strain themselves in sunny or Mediterranean climates, and indoor growers should wait 50 to 70 days for Jack Herer to flower.',
          type: "hybrid",
          tags: "sativa-dominant,creative",
          format: "flower"
        },
        {
          id: 2,
          name: "Dream Queen",
          image_url:
            "https://images.leafly.com/flower-images/defaults/frosty/strain-6.png",
          description:
            "Dream Queen is a hybrid marijuana strain made by crossing Blue Dream with Space Queen. Dream Queen produces effects that will leave you in a euphoric, dream-like state after just a few puffs. This strain is pungent and reminiscent of pineapple, bubblegum, citrus and menthol. Growers say this strain comes in very frosty, light green buds. This strain will have you sticking your nose back in the jar over and over again to smell its unique aroma.",
          type: "hybrid",
          tags: "sativa-dominant,dreamy",
          format: "flower"
        },
        {
          id: 3,
          name: "Bio Jesus",
          image_url:
            "https://tv.dopemagazine.com/wp-content/uploads/2019/01/bio-jesus.jpg",
          description:
            "Bio-Jesus is a hybrid marijuana strain known for its numbing potency and exceptional pain relief application. This strain is made by crossing Gumbo with Bio-Diesel. Bio-Jesus produces intense body effects and a euphoric haze that is ideal for nighttime use. Medical marijuana patients choose this strain to help relieve symptoms associated with insomnia.",
          type: "hybrid",
          tags: "indica-dominant,pain-relief",
          format: "flower"
        },
      ]);
    });
};
