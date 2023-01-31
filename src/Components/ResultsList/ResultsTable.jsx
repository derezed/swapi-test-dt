import moment from "moment";
import React  from 'react'
import PropTypes from 'prop-types';

const ResultsTable = (props) => {
  const results = props.results;
  const firstResult = results[0];
  const specialCases = [
    'created',
    'edited',
    'films',
    'pilots',
    'url'
  ];

  return (
    <section className='w-full'>
      <div className='h-full max-h-[400px] overflow-x-auto md:max-h-[500px]'>
        <table className='text-white min-w-full'>
          <caption className='text-left'>
            <span>{props.selectedManufacturer} Starships</span>
            <br />
            <span className='text-sm'>Results: {results.length}</span>
            <br />
            <span className='text-sm'>Scroll (X/Y) for more details</span>
          </caption>

          <thead className='border-b'>
            <tr>
              {Object.keys(firstResult).map((detail, index) => {

                return (
                  <th key={index} scope='col' className='capitalize border-b-2 text-sm font-medium px-3 pb-2 text-left'>
                    {detail.replaceAll('_', ' ')}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {results && results.map((result, index) => {
              const dateFormat = 'MMM Do YYYY, h:mm:ss a';
              const createdDate = moment(result.created).format(dateFormat);
              const editedDate = moment(result.edited).format(dateFormat);

              return (
                <tr key={index} className='border-b'>
                  {Object.keys(result).map((key, index) => {
                    // the detail in question is not in our special cases list so it's a string
                    if (!specialCases.includes(key)) {

                      return (
                        <td key={index} className='text-sm font-light px-3 py-2 whitespace-nowrap'>
                          {result[key]}
                        </td>
                      );
                    } else if (specialCases.includes(key)) {
                      // spit out a URL since nested url fetching may not be in the scope of a "simple" app
                      if (key === 'url') {

                        return (
                          <td key={index} className='text-sm font-light px-3 py-2 whitespace-nowrap'>
                            <a className='text-yellow-500 underline hover:no-underline' href={result[key]} rel='noopener nofollow' target='_blank'>View At SWAPI.dev</a>
                          </td>
                        );
                      // Dates are easy though!
                      } else if (key === 'edited' || key === 'created') {

                        return (
                          <td key={index} className='text-sm font-light px-3 py-2 whitespace-nowrap'>
                            {key === 'edited' ? editedDate : createdDate}
                          </td>
                        );
                      // spit out a URL since nested url/detail fetching may not be in the scope of a "simple" app
                      } else if (key === 'films' || key === 'pilots') {
                        if (key === 'films') {
                          const myFilms = result.films;
                          let fullFilmData = null;

                          if (myFilms.length) {
                            fullFilmData = props.allFilms.filter(fullFilm => myFilms.includes(fullFilm.url));
                          }

                          return (
                            <td key={index} className='text-sm font-light px-3 py-2 whitespace-nowrap'>
                              <ul>
                                {fullFilmData.length && fullFilmData.map((film, index) => {
                                  return (
                                    <li key={index}>
                                      <a href={film.url} className='text-yellow-500 underline hover:no-underline' rel='noopener nofollow' target='_blank'>{film.title}</a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </td>
                          );
                        } else {
                          const myPilots = result.pilots
                          let fullPilotData = null;

                          if (myPilots.length) {
                            fullPilotData = props.allPilots.filter(fullPilot => myPilots.includes(fullPilot.url) );
                          }

                          return (
                            <td key={index} className='text-sm font-light px-3 py-2 whitespace-nowrap'>
                              <ol>
                                {fullPilotData && fullPilotData.map((pilot, index) => {
                                  return (
                                    <li key={index}>
                                      <a href={pilot.url} className='text-yellow-500 underline hover:no-underline' rel='noopener nofollow' target='_blank'>{pilot.name}</a>
                                    </li>
                                  );
                                })}
                              </ol>
                            </td>
                          );
                        }
                      }
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

ResultsTable.propTypes = {
  results: PropTypes.array.isRequired,
  selectedManufacturer: PropTypes.string.isRequired,
}

export default ResultsTable;
