# kopper-infinite-scroll
A small library for infinite paginated scroll views in html/js

[![Build Status](https://travis-ci.org/benconnito/kopper-infinite-scroll.svg)](https://travis-ci.org/benconnito/kopper-infinite-scroll)
[![Coverage Status](https://coveralls.io/repos/github/benconnito/kopper-infinite-scroll/badge.svg?branch=master)](https://coveralls.io/github/benconnito/kopper-infinite-scroll?branch=master)
[![Dependency Status](https://david-dm.org/benconnito/kopper-infinite-scroll.svg)](https://david-dm.org/benconnito/kopper-infinite-scroll)
[![devDependency Status](https://david-dm.org/benconnito/kopper-infinite-scroll/dev-status.svg)](https://david-dm.org/benconnito/kopper-infinite-scroll#info=devDependencies)

Instantiate a KopperInfiniteScroll object and pass it your view (any jquery compatible element). Override getPaginatedCollection and populatePaginatedList on the KopperInfiniteScroll object with your implementations.