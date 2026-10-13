import portfolio from '../../styles/portfolio.css?raw';
import motes from '../../styles/motes.css?raw';
export function GET(){return new Response(`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Work+Sans:wght@400;500;600&display=swap');\n${portfolio}\n${motes}`,{headers:{'Content-Type':'text/css; charset=utf-8'}});}
