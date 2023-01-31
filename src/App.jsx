import React, { useEffect, useState, useRef } from 'react'
import ResultsTable from './Components/ResultsList/ResultsTable';
import SearchForm from './Components/SearchForm/SearchForm';

const App = () => {
  const selectInputRef = useRef(null); // The select dropdown
  const [status, setStatus] = useState('loading'); // loading, loaded, displays loader animation
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // Confirms we have queried Manufactureres before we display select
  const [allStarships, setAllStarships] = useState([]);
  const [page, setPage] = useState(1); // what pagination page are we on
  const [manufacturers, setManufacturers] = useState([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [filteredShips, setFilteredShips] = useState(null);
  const shipsToUse = filteredShips ?? allStarships;
  const [allPilots, setAllPilots] = useState([]);
  const [allPilotData, setAllPilotData] = useState([]);
  const [allFilms, setAllFilms] = useState([]);
  const [allFilmData, setAllFilmData] = useState([]);

  /**
   * Filters/movies/pilots down to those ships that have the values we want.
   * We use this match against urls when genererating the table to display what films/people
   */
  const determineMoviesToFetch = () => {
    const allShipsWithFilms = allStarships.filter(ship => ship.films.length > 0);
    let filmsToFetch = [];

    allShipsWithFilms.forEach((ship) => {
      const existingFilms = [...filmsToFetch];
      const newFilms = [...ship.films];
      const joinedFilms = [...existingFilms, ...newFilms];

      filmsToFetch = [...new Set(joinedFilms)];
    });

    setAllFilms(filmsToFetch);
  }

  const determinePilotsToFetch = () => {
    const helmedShips = allStarships.filter(ship => ship.pilots.length > 0);
    let pilotsToFetch = [];

    helmedShips.forEach((ship) => {
      const existingPilots = [...pilotsToFetch];
      const newPilots = [...ship.pilots];
      const joinedPilots = [...existingPilots, ...newPilots];

      pilotsToFetch = [...new Set(joinedPilots)];
    });

    setAllPilots(pilotsToFetch);
  }

  const fetchPromiseData = url => {
    return fetch(url).then(response => response.json());
  }

  const resolvePromiseUrls = urls => {
    return Promise.all(urls.map(url => fetchPromiseData(url)));
  };

  /**
   * Instead of looping over & awaiting & setting time outs, a Resolving all these known urls as a single promise (each) seems the most efficient.
   */
  const handleFilmDataFetch = () => {
    resolvePromiseUrls(allFilms).then(data => {
      setAllFilmData(data);
    });
  }

  const handlePilotDataFetch = () => {
    resolvePromiseUrls(allPilots).then(data => {
      setAllPilotData(data);
    });
  }

  /**
   * "Recursive" function that queries starship end points for all of our data.
   * We do this instead of a PromiseAll type setup because we don't know all the URL's before hand.
   */
  const fetchStarshipData = async queryPage => {
    await fetch(`https://swapi.dev/api/starships/?page=${queryPage}`, {
      method: 'get'
    }).then(response => response.json()).then((result) => {
      const existingShips = [...allStarships];
      const newShips = result.results;
      const joinedShips = [...newShips, ...existingShips];
      const nextPage = result?.next?.split('/?page=')[1] ?? null;

      setAllStarships(joinedShips);
      setPage(nextPage);
    });
  }

  /**
   * Create our array of manufacturers from starships to use as select options in the search form component.
   */
  const createManufacturersArray = () => {
    let allManufacturers = [];

      allStarships.forEach((ship) => {
        const shipManufacturers = ship.manufacturer.split(', ');
        const joinedManufacturers = [...shipManufacturers, ...allManufacturers];

        allManufacturers = [...new Set(joinedManufacturers)];
      });

      // Because the data has varying instance of Inc, we dropped them during the split so they exist in the manufacutrers array, lets remove them now
      allManufacturers = allManufacturers.filter((manufacturer => {
        return manufacturer !== 'Inc.' && manufacturer !== 'Inc' && manufacturer !== 'Incorporated' ? manufacturer : false;
      }));

      setManufacturers(allManufacturers);
  }

  const handleFormSubmit = () => {
    setSelectedManufacturer(selectInputRef.current.value);
  }

  /**
   * If page is not null, run a query for the current page (starts at 1) to get all starships.
   * The end of 'fetchStarshipData` sets the next page (from the api), so this useEffect will refire once setPage runs.
   */
  useEffect(() => {
    if (page !== null) {
      fetchStarshipData(page);
    }
  }, [page]);

  // Once we have ships and no more pages to query, parse out our manufacturers, pilots, and movies.
  useEffect(() => {
    if (allStarships.length > 0 && page === null) {
      createManufacturersArray();
      determinePilotsToFetch();
      determineMoviesToFetch();
    }
  }, [allStarships, page]);

  // Once we have all pilots fetch their data
  useEffect(() => {
    if (allPilots.length > 0 && page === null) {
      handlePilotDataFetch();
    }
  }, [allPilots, page]);

  // Once we have all films fetch their data
  useEffect(() => {
    if (allFilms.length > 0 && page === null) {
      handleFilmDataFetch();
    }
  }, [allFilms, page]);

  // Once we have everything, clear our loader and show relevant user interaction items
  useEffect(() => {
    if (allStarships && manufacturers && allPilotData && allFilmData && page === null) {
      setHasInitialLoad(true);
      setStatus('loaded')
    }
  }, [allStarships, manufacturers, allPilotData, allFilmData, page]);

  // Anytime selectedManufacturer changes this useEffect fires and filters/resets all ships.
  useEffect(() => {
    if (selectedManufacturer) {
      let foundShips = null;

      setStatus('loading');

      if (selectedManufacturer !== 'All') {
        foundShips = allStarships.filter(ship => ship.manufacturer.includes(selectedManufacturer));
      }

      setTimeout(() => {
        setFilteredShips(foundShips);
        setStatus('loaded');
      }, 1000);
    }
  }, [selectedManufacturer]);

  // Anytime status changes, disable/reenable the select inputs selectability
  useEffect(() => {
    if (status === 'loading' && selectInputRef.current) {
      selectInputRef.current.disabled = true;
    }

    if (status === 'loaded' && selectInputRef.current) {
      selectInputRef.current.disabled = false;
    }
  }, [status]);

  return (
    <div className='flex flex-col items-center gap-y-5 px-5'>
      {hasInitialLoad &&
        <SearchForm
          handleFormSubmit={handleFormSubmit}
          selectInputRef={selectInputRef}
          options={manufacturers}
        />
      }

      {status === 'loading' &&
        <svg className='w-[100px] h-auto animate-spin' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path className='stroke-white' strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      }

      {status === 'loaded' && hasInitialLoad &&
        <ResultsTable
          results={shipsToUse}
          selectedManufacturer={selectedManufacturer}
          allPilots={allPilotData}
          allFilms={allFilmData}
        />
      }
    </div>
  )
}

export default App;
