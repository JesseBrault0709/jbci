# TODO

## next goals

-   [x] `Config` should be from json or js/ts
-   [x] `Config.type` should be a string literal such as `'github'` or `'custom'`.
-   [x] `Config.secret` should be only for `type: 'github'`
-   [x] `Config.auth` should be a function, available for any type, which will be the auth handler/middleware/something.
-   [x] Fix all that the above entail.
-   [ ] Add some kind of db/logging/frontend for remote monitoring.

## done

-   [x] Do **not** wait for `exec` in `ScriptRunner`. Doing so can cause a timeout. If we get as far as running the script, we should just return `200 OK`.
-   [x] Figure out issue with `process.env` and `JAVA_HOME`. This might be frustrating.
-   [x] Find a way to deal with refs/etc. so we can select events based on to which branch they apply.
