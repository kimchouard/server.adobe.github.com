Hello Google (:

Example binary tree:
         1
        / \
       /   \
      /     \
     2       3
    / \     /
   4   5   6
  /       / \
 7       8   9

INPUT:
preorder:    1 2 4 7 5 3 6 8 9
inorder:     7 4 2 5 1 8 6 9 3

OUTPUT:
level-order: 1 2 3 4 5 6 7 8 9


CODE
=======

var tree = {
	node: i,
	left: ,
	right: ,
}

var preorder = [1, 2, 4, 7, 5, 3, 6, 8, 9];
var inorder = [7, 4, 2, 5, 1, 8, 6, 9, 3];

var builtTree = function (preorder, inorder) {
	if (preorder == null) {
		return tree;
	} else {
tree.node = preorder[0];

tree.left = buildTree(preorder.remove(0), inorder);

if (inorder[0] == preorder[0]) {
tree.right = builtTree( ); 



// We need a recursive call
if (first == inorder[0]) {
	tree.add(preorder[0]);
	builtTree(preorder.remove(0),  );
}
		var tree = {
value: preorder[0];
left:
};

		
	}
}
