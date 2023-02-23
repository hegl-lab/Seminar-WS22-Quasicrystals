class KDTreeNode {
  constructor(point, depth = 0) {
    this.point = point;
    this.left = null;
    this.right = null;
    this.depth = depth;
  }
}

class KDTree {
  constructor(points) {
    this.root = this.buildTree(points, 0);
  }

  buildTree(points, depth) {
    if (points.length === 0) {
      return null;
    }

    const dimension = points[0].length;
    const axis = depth % dimension;

    points.sort((a, b) => a[axis] - b[axis]);

    const median = Math.floor(points.length / 2);
    const node = new KDTreeNode(points[median], depth);

    node.left = this.buildTree(points.slice(0, median), depth + 1);
    node.right = this.buildTree(points.slice(median + 1), depth + 1);

    return node;
  }

  search(point) {
    return this.searchHelper(this.root, point);
  }

  searchHelper(node, point) {
    if (!node) {
      return false;
    }

    if (this.arePointsEqual(node.point, point)) {
      return true;
    }

    const dimension = point.length;
    const axis = node.depth % dimension;

    if (point[axis] < node.point[axis]) {
      return this.searchHelper(node.left, point);
    } else {
      return this.searchHelper(node.right, point);
    }
  }

  arePointsEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  insert(point) {
    this.root = this.insertHelper(this.root, point, 0);
  }

  insertHelper(node, point, depth) {
    if (!node) {
      return new KDTreeNode(point, depth);
    }

    const dimension = point.length;
    const axis = depth % dimension;

    if (point[axis] < node.point[axis]) {
      node.left = this.insertHelper(node.left, point, depth + 1);
    } else {
      node.right = this.insertHelper(node.right, point, depth + 1);
    }

    return node;
  }

  *inOrderTraversal() {
    yield* this.inOrderTraversalHelper(this.root);
  }

  *inOrderTraversalHelper(node) {
    if (!node) {
      return;
    }

    yield* this.inOrderTraversalHelper(node.left);
    yield node.point;
    yield* this.inOrderTraversalHelper(node.right);
  }

  findNearestNeighbor(point) {
    let bestDistance = Number.MAX_SAFE_INTEGER;
    let bestPoint = null;
    this.findNearestNeighborHelper(this.root, point, bestDistance, bestPoint);
    return { bestDistance: bestDistance, bestPoint: bestPoint };
  }

  findNearestNeighborHelper(node, point, bestDistance, bestPoint) {
    if (!node) {
      return;
    }

    const distance = this.distance(node.point, point);
    if (distance < bestDistance) {
      bestDistance.value = distance;
      bestPoint.value = node.point;
    }

    const dimension = point.length;
    const axis = node.depth % dimension;
    const leftSearch = point[axis] < node.point[axis] ? node.left : node.right;
    const rightSearch = point[axis] < node.point[axis] ? node.right : node.left;

    this.findNearestNeighborHelper(leftSearch, point, bestDistance, bestPoint);

    if (this.distanceToSplittingPlane(node, point) < bestDistance.value) {
      this.findNearestNeighborHelper(
        rightSearch,
        point,
        bestDistance,
        bestPoint
      );
    }
  }

  distance(a, b) {
    // Euclidean distance
    let d = 0;
    for (let i = 0; i < a.length; i++) {
      d += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(d);
  }

  distanceToSplittingPlane(node, point) {
    const dimension = point.length;
    const axis = node.depth % dimension;
    return Math.abs(point[axis] - node.point[axis]);
  }

  toJSON() {
    return JSON.stringify(this.root);
  }

  static fromJSON(json) {
    const root = JSON.parse(json);
    const tree = new KDTree();
    tree.root = root;
    return tree;
  }
}
