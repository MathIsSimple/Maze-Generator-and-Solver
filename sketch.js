class Cell {
      constructor(x, y, walls) {
            this.x = x;
            this.y = y;
            this.walls = walls;
      }

      hasChanged() {
            return !(
                  this.walls[0] == 1 && this.walls[1] == 1 &&
                  this.walls[2] == 1 && this.walls[3] == 1
            );
      }

      render(SCALE) {
            let renderX = 0,
                  renderY = 0,
                  renderW = 0,
                  renderH = 0;
            if (this.hasChanged()) {
                  if (this.walls[0] == 1) {
                        renderX = this.x * SCALE;
                        renderY = this.y * SCALE;
                        renderW = SCALE;
                        renderH = 2;
                        context.fillRect(renderX, renderY, renderW, renderH);
                  }
                  if (this.walls[1] == 1) {
                        renderX = this.x * SCALE + SCALE - 2;
                        renderY = this.y * SCALE;
                        renderW = 2;
                        renderH = SCALE;
                        context.fillRect(renderX, renderY, renderW, renderH);
                  }
                  if (this.walls[2] == 1) {
                        renderX = this.x * SCALE;
                        renderY = this.y * SCALE + SCALE - 2;
                        renderW = SCALE;
                        renderH = 2;
                        context.fillRect(renderX, renderY, renderW, renderH);
                  }
                  if (this.walls[3] == 1) {
                        renderX = this.x * SCALE;
                        renderY = this.y * SCALE;
                        renderW = 2;
                        renderH = SCALE;
                        context.fillRect(renderX, renderY, renderW, renderH);
                  }
            }
      }
}

class MazeGenerator {
      constructor(ITERATIONS_PER_FRAME, SCALE) {
            this.visited = [
                  [0, 0]
            ];

            this.stack = this.visited.slice();
            this.scale = SCALE;

            this.currentPosition = [0, 0];

            this.iterations_per_frame = ITERATIONS_PER_FRAME;

            this.cols = Math.floor(width / this.scale);
            this.rows = Math.floor(height / this.scale);

            this.ended = false;
            this.cells = [];

            this.doRender = true;

            for (let x = 0; x < this.cols; x++) {
                  for (let y = 0; y < this.rows; y++) {
                        this.cells.push(new Cell(x, y, [1, 1, 1, 1]));
                  }
            }
      }

      render() {
            this.renderStack();
            this.renderCells();
            this.renderPosition();

            if (this.ended == true && this.doRender == true) {
                  this.doRender = false;
                  mazeSol.solve(this.cells);
            }
      }

      renderStack() {
            if (this.ended == false) {
                  context.fillStyle = 'rgb(100, 150, 255)';
                  for (let i = 0; i < this.stack.length; i++) {
                        context.fillRect(this.stack[i][0] * this.scale, this.stack[i][1] * this.scale, this.scale, this.scale);
                  }
            }
      }

      renderCells() {
            context.fillStyle = 'rgb(255, 255, 255)';
            for (let cell of this.cells) {
                  cell.render(this.scale);
            }
      }

      renderPosition() {
            if (this.ended == false) {
                  context.fillStyle = 'rgb(0, 255, 50)';
                  context.fillRect(this.currentPosition[0] * this.scale, this.currentPosition[1] * this.scale, this.scale, this.scale);
            }
      }

      update() {
            if (this.ended == false) {
                  for (let i = 0; i < this.iterations_per_frame; i++) {
                        if (this.visited.length < this.rows * this.cols) {
                              let currentCellx = this.currentPosition[0];
                              let currentCelly = this.currentPosition[1];
                              let currentCellIndex = this.findCellIndex(currentCellx, currentCelly);

                              let possibleNeighbours = [
                                    [currentCellx, currentCelly - 1],
                                    [currentCellx + 1, currentCelly],
                                    [currentCellx, currentCelly + 1],
                                    [currentCellx - 1, currentCelly]
                              ];

                              let notVisitedNeighbours = [];

                              for (let possibleNeighbour of possibleNeighbours) {
                                    if (this.isVisited(possibleNeighbour[0], possibleNeighbour[1]) == false) {
                                          notVisitedNeighbours.push([possibleNeighbour[0], possibleNeighbour[1]]);
                                    }
                              }

                              if (notVisitedNeighbours.length > 0) {
                                    let randomNeighbourIndex = Math.round(
                                          random(0, notVisitedNeighbours.length - 1)
                                    );
                                    let ChosenNeighbourx = notVisitedNeighbours[randomNeighbourIndex][0];
                                    let ChosenNeighboury = notVisitedNeighbours[randomNeighbourIndex][1];
                                    let ChosenNeighbourIndex = this.findCellIndex(
                                          ChosenNeighbourx, ChosenNeighboury
                                    );

                                    this.stack.push([ChosenNeighbourx, ChosenNeighboury]);

                                    if (ChosenNeighbourx > currentCellx) {
                                          this.cells[currentCellIndex].walls[1] = 0;
                                          this.cells[ChosenNeighbourIndex].walls[3] = 0;
                                    }
                                    if (ChosenNeighbourx < currentCellx) {
                                          this.cells[currentCellIndex].walls[3] = 0;
                                          this.cells[ChosenNeighbourIndex].walls[1] = 0;
                                    }
                                    if (ChosenNeighboury > currentCelly) {
                                          this.cells[currentCellIndex].walls[2] = 0;
                                          this.cells[ChosenNeighbourIndex].walls[0] = 0;
                                    }
                                    if (ChosenNeighboury < currentCelly) {
                                          this.cells[currentCellIndex].walls[0] = 0;
                                          this.cells[ChosenNeighbourIndex].walls[2] = 0;
                                    }

                                    this.visited.push([ChosenNeighbourx, ChosenNeighboury]);
                                    this.currentPosition = [ChosenNeighbourx, ChosenNeighboury];
                              } else {
                                    if (this.stack.length > 0) this.currentPosition = this.stack.pop();
                              }
                        } else if (this.ended == false) {
                              this.cells[0].walls[3] = 0;
                              this.cells[this.cells.length - 1].walls[1] = 0;

                              this.ended = true;
                              break;
                        }
                  }
            }
      }

      findCellIndex(x, y) {
            let index = 0;
            for (let c of this.cells) {
                  if (c.x == x && c.y == y) {
                        return index;
                  }
                  index++;
            }
            return -1;
      }

      isVisited(x, y) {
            if (x >= 0 && y >= 0 && x < this.cols && y < this.rows) {
                  for (let v of this.visited) {
                        if (v[0] == x && v[1] == y) {
                              return true;
                        }
                  }
                  return false;
            }
            return true;
      }
}

class MazeSolver {
      constructor(ITERATIONS_PER_FRAME, SCALE, NUMBER_OF_MICE) {
            this.cells = [];
            this.mice = [];
            for (let i = 0; i < NUMBER_OF_MICE; i++) {
                  this.mice.push({
                        position: [0, 0],
                        path: []
                  });
            }
            this.solvedMouse = -1;
            this.scale = SCALE;
            this.cols = Math.floor(width / SCALE);
            this.rows = Math.floor(height / SCALE);
            this.isSolving = false;
            this.solved = false;
            this.before = [];
            this.iterations_per_frame = ITERATIONS_PER_FRAME;
      }

      exists(x, y) {
            return (x >= 0 && y >= 0 && x < this.cols && y < this.rows);
      }

      getIndex(x, y) {
            let index = 0;
            for (let c of this.cells) {
                  if (c.x == x && c.y == y) {
                        return index;
                  }
                  index++;
            }
            return -1;
      }

      solve(cells) {
            this.isSolving = true;
            this.cells = cells;
      }

      update() {
            let quit = false;
            for (let i = 0; i < this.iterations_per_frame; i++) {
                  if (this.solved == false) {
                        if (this.solved == false && this.isSolving == true) {
                              let mouseIndex = 0;
                              for (let mouse of this.mice) {
                                    let currentCellx = mouse.position[0];
                                    let currentCelly = mouse.position[1];
                                    let currentCellIndex = this.getIndex(currentCellx, currentCelly);

                                    let possibleNeighbours = [
                                          [currentCellx, currentCelly - 1],
                                          [currentCellx + 1, currentCelly],
                                          [currentCellx, currentCelly + 1],
                                          [currentCellx - 1, currentCelly]
                                    ];

                                    let neighbours = [];

                                    for (let possibleNeighbour of possibleNeighbours) {
                                          let possibleNeighbourX = possibleNeighbour[0];
                                          let possibleNeighbourY = possibleNeighbour[1];
                                          if (this.exists(possibleNeighbourX, possibleNeighbourY) == true) {
                                                let addNeighbour = false;
                                                let currentCellWallIndexCheck = 0;
                                                let possibleNeighbourWallIndexCheck = 0;
                                                let possibleNeighbourIndex = this.getIndex(possibleNeighbourX, possibleNeighbourY);

                                                if (possibleNeighbourX > currentCellx) {
                                                      currentCellWallIndexCheck = 1;
                                                      possibleNeighbourWallIndexCheck = 3;
                                                } else if (possibleNeighbourX < currentCellx) {
                                                      currentCellWallIndexCheck = 3;
                                                      possibleNeighbourWallIndexCheck = 1;
                                                } else if (possibleNeighbourY > currentCelly) {
                                                      currentCellWallIndexCheck = 2;
                                                      possibleNeighbourWallIndexCheck = 0;
                                                } else if (possibleNeighbourY < currentCelly) {
                                                      currentCellWallIndexCheck = 0;
                                                      possibleNeighbourWallIndexCheck = 2;
                                                }

                                                if (this.cells[currentCellIndex].walls[currentCellWallIndexCheck] == 0 ||
                                                      this.cells[possibleNeighbourIndex].walls[possibleNeighbourWallIndexCheck] == 0) {
                                                      addNeighbour = true;
                                                }

                                                if (addNeighbour) neighbours.push([possibleNeighbourX, possibleNeighbourY]);
                                          }
                                    }

                                    let randomNeighbourIndex = Math.round(
                                          random(0, neighbours.length - 1)
                                    );

                                    mouse.position[0] = neighbours[randomNeighbourIndex][0];
                                    mouse.position[1] = neighbours[randomNeighbourIndex][1];

                                    mouse.path.push([mouse.position[0], mouse.position[1]]);

                                    if (mouse.position[0] == this.cols - 1 && mouse.position[1] == this.rows - 1) {
                                          this.solved = true;
                                          this.isSolving = false;
                                          this.solvedMouse = mouseIndex;
                                          this.before = this.mice[this.solvedMouse].path;
                                          quit = true;

                                          this.simplyPath(10);

                                          this.render();
                                          break;
                                    } else if (i % this.iterations_per_frame - 1 === 0) this.render();

                                    mouseIndex++;
                              }
                        }
                  }
                  if (quit == true) break;
            }
      }

      simplyPath(n_mice) {
            let mice_path = new Array(n_mice);
            for (let i = 0; i < n_mice; i++) {
                  let mousePath = [[0, 0]];
                  let mousePosition = [0, 0];

                  let ended = false;

                  while (ended == false) {
                        let mousePositionIndex = this.getIndex(mousePosition[0], mousePosition[1]);
                        let possibleNeighbours = [
                              [mousePosition[0], mousePosition[1] - 1],
                              [mousePosition[0] + 1, mousePosition[1]],
                              [mousePosition[0], mousePosition[1] + 1],
                              [mousePosition[0] - 1, mousePosition[1]]
                        ];

                        let neighbours = [];

                        for (let possibleNeighbour of possibleNeighbours) {
                              let possibleNeighbourX = possibleNeighbour[0];
                              let possibleNeighbourY = possibleNeighbour[1];

                              let possibleNeighbourExists = false;
                              let possibleNeighbourReachable = false;

                              for (let el of this.mice[this.solvedMouse].path) {
                                    let elX = el[0];
                                    let elY = el[1];
                                    let elI = this.getIndex(el[0], el[1]);

                                    if (possibleNeighbourX == elX && possibleNeighbourY == elY) {
                                          possibleNeighbourExists = true;

                                          if (mousePosition[0] < elX) {
                                                if (this.cells[elI].walls[3] == 0 && this.cells[mousePositionIndex].walls[1] == 0) {
                                                      possibleNeighbourReachable = true;
                                                }
                                          }

                                          if (mousePosition[0] > elX) {
                                                if (this.cells[elI].walls[1] == 0 && this.cells[mousePositionIndex].walls[3] == 0) {
                                                      possibleNeighbourReachable = true;
                                                }
                                          }

                                          if (mousePosition[1] < elY) {
                                                if (this.cells[elI].walls[0] == 0 && this.cells[mousePositionIndex].walls[2] == 0) {
                                                      possibleNeighbourReachable = true;
                                                }
                                          }

                                          if (mousePosition[1] > elY) {
                                                if (this.cells[elI].walls[2] == 0 && this.cells[mousePositionIndex].walls[0] == 0) {
                                                      possibleNeighbourReachable = true;
                                                }
                                          }

                                          break;
                                    }
                              }

                              if (possibleNeighbourExists == true && possibleNeighbourReachable == true) {
                                    neighbours.push([possibleNeighbourX, possibleNeighbourY]);
                              }
                        }

                        if (neighbours.length != 0) {
                              let randomNeighbourIndex = Math.round(
                                    random(0, neighbours.length - 1)
                              );

                              mousePosition[0] = neighbours[randomNeighbourIndex][0];
                              mousePosition[1] = neighbours[randomNeighbourIndex][1];

                              mousePath.push([mousePosition[0], mousePosition[1]]);

                              if (mousePosition[0] == this.cols - 1 && mousePosition[1] == this.rows - 1) {
                                    mice_path[i] = mousePath;
                                    ended = true;
                                    console.log("finished "+(i+1)+" / "+n_mice);
                                    break;
                              }
                        } else {
                              mice_path[i] = mousePath;
                              break;
                        }
                  }
            }

            let lowest_index = -1;
            let lowest_length = Infinity;

            let index = 0;

            for (let mousePath of mice_path) {
                  if (mousePath.length < lowest_length) {
                        lowest_length = mousePath.length;
                        lowest_index = index;
                  }
                  index++;
            }

            this.mice[this.solvedMouse].path = mice_path[lowest_index];
      }

      render() {
            if (this.isSolving == false && this.solved == true) {
                  context.fillStyle = 'rgb(51, 51, 51)';
                  context.fillRect(0, 0, width, height);

                  mazeGen.render();

                  context.strokeStyle = "red";
                  context.lineWidth = 3;
                  let lx = 0.5 * this.scale;
                  let ly = 0.5 * this.scale;
                  for (let i = 0; i < this.before.length; i++) {
                        let px = this.before[i][0] * this.scale + this.scale / 2;
                        let py = this.before[i][1] * this.scale + this.scale / 2;
                        context.beginPath();
                        context.moveTo(lx, ly);
                        context.lineTo(px, py);
                        context.stroke();
                        lx = px;
                        ly = py;
                  }

                  let mouseWhoSolvedTheMaze = this.mice[this.solvedMouse];
                  context.strokeStyle = "green";
                  context.lineWidth = 3;
                  lx = 0.5 * this.scale;
                  ly = 0.5 * this.scale;
                  for (let i = 0; i < mouseWhoSolvedTheMaze.path.length; i++) {
                        let px = mouseWhoSolvedTheMaze.path[i][0] * this.scale + this.scale / 2;
                        let py = mouseWhoSolvedTheMaze.path[i][1] * this.scale + this.scale / 2;
                        context.beginPath();
                        context.moveTo(lx, ly);
                        context.lineTo(px, py);
                        context.stroke();
                        lx = px;
                        ly = py;
                  }
                  clearInterval(intervalID);
            } else {
                  for (let mouse of this.mice) {
                        context.fillStyle = 'rgb(80, 255, 0)';
                        context.fillRect(mouse.position[0] * this.scale, mouse.position[1] * this.scale, this.scale, this.scale);
                  }
            }
      }
}

function random(min, max) {
      return Math.random() * max - min;
}

const width = 500, height = 500;
const mazeGenInterval = 100;
const mazeSolInterval = 1000;
const scale = 50, numberOfMice = 10;

document.body.style.margin = "0px";
let canvas = document.createElement("canvas");
canvas.setAttribute('width', '' + width);
canvas.setAttribute('height', '' + height);
document.body.appendChild(canvas);

let context = canvas.getContext("2d");

let mazeGen = new MazeGenerator(mazeGenInterval, scale);
let mazeSol = new MazeSolver(mazeSolInterval, scale, numberOfMice);

let intervalID = setInterval(draw, 1 / (60 * 1000));

function draw() {
      context.fillStyle = 'rgb(51, 51, 51)';
      context.fillRect(0, 0, width, height);

      mazeGen.render();
      mazeGen.update();

      mazeSol.update();
}

window.onload = function () {
      document.body.style.margin = "0px";
      document.body.style.padding = "0px";
      document.body.style.background = "rgb(51, 51, 51)";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.style.position = "absolute";
      canvas.style.top = "calc(50% - " + height / 2 + "px)";
      canvas.style.left = "calc(50% - " + width / 2 + "px)";
}