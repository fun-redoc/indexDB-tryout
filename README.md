### Summary

The most important objective of this project is to provide a wrapper for the browsers built in IndexDB (https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

The __Wrapper__ is located in `dbmanagement/DBManager.ts` file and can be simply reused in other projects simply by copying.

The rest is an vite.js built simple ToDo application to democase the usage.

Also a good point for resue is the `AppContextProvider.tsx`.

__Issues__ may arise, becaus of the inherent asyncronity of the indexDB API especially on connecting to the indexDB. See e.g the useEffect of the `App.tsx` Component.