# TODO

-   [x] Do **not** wait for `exec` in `ScriptRunner`. Doing so can cause a timeout. If we get as far as running the script, we should just return `200 OK`.
-   [x] Figure out issue with `process.env` and `JAVA_HOME`. This might be frustrating.
-   [x] Find a way to deal with refs/etc. so we can select events based on to which branch they apply.
